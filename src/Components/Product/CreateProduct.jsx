import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "../../ui/buttons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../ui/Card";
import { Label } from "@radix-ui/react-label";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { InputTextarea } from "primereact/inputtextarea";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { createProduct, fetchProductById, updateProduct } from "./ProductAPI";
import { toast } from "react-toastify";
import {
  fetchCategory,
  fetchSubCategory,
} from "../CategoryManagement/categoriesAPI";
import { fetchBrandOptions } from "../BrandOptions/brandOptionsAPI";
import { fetchMaterialOptions } from "../MaterialOptions/materialOptionsAPI";
import { Link, useLocation, useParams } from "wouter";

export default function CreateProductForm() {
  const dispatch = useDispatch();
  const { productId } = useParams();
  const { productById, loadingProductFetch, errorProductFetch } = useSelector(
    (state) => state.product,
  );
  const fetchProductDetails = useCallback(() => {
    dispatch(fetchProductById(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (productId) fetchProductDetails();
  }, [fetchProductDetails, productId]);
  const [location, navigate] = useLocation();
  const { categories, subCategories } = useSelector((s) => s.category);
  const { brandOptions } = useSelector((s) => s.brandOption);
  const { materialOptions } = useSelector((s) => s.materialOption);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: null,
    subCategory: null,
    brand: null,
    material: null,
    color: [],
    size: { length: "", width: "", height: "", weight: "" },
    price: { min: "", max: "" },
    features: [],
  });

  const [bannerImage, setBannerImage] = useState(null);
  const [images, setImages] = useState([{ file: null }]);
  const [features, setFeatures] = useState([{ value: "" }]);

  const [catalogues, setCatalogues] = useState([
    { type: "", bannerImage: null, pdfFile: null },
  ]);

  useEffect(() => {
    if (location === "/create-product") {
      setFormData({
        name: "",
        description: "",
        category: null,
        subCategory: null,
        brand: null,
        material: null,
        color: [],
        size: { length: "", width: "", height: "", weight: "" },
        price: { min: "", max: "" },
        features: [],
      });
    } else if (location.startsWith("/edit-product") && productById) {
      if (productById.category?._id) {
        dispatch(fetchSubCategory(productById.category._id));
      }
      setFormData({
        name: productById.name || "",
        description: productById.description || "",
        category: productById.category?._id || null,
        subCategory: productById.subCategory?._id || null,
        brand: productById.brand?._id || null,
        material: productById.material?._id || null,
        color: productById.color?.map((item) => item) || [],
        size: {
          length: productById.size?.length || "",
          width: productById.size?.width || "",
          height: productById.size?.height || "",
          weight: productById.size?.weight || "",
        },
        price: {
          min: productById.price?.min || "",
          max: productById.price?.max || "",
        },
        features: productById.features?.map((item) => item) || [],
      });
      setCatalogues(
        (productById.catalogues || [])?.map((c) => ({
          type: c.type || "",
          pdfFile: c.pdfFile || null,
          bannerImage: c.bannerImage || null,
        })),
      );
      setFeatures(
        productById.features?.map((item) => ({ value: item })) || [
          { value: "" },
        ],
      );
      setBannerImage(productById.bannerImage);
      setImages(
        (productById.images || []).map((img) => ({
          file: img,
        })),
      );
    }
  }, [location, productById, dispatch]);

  useEffect(() => {
    dispatch(fetchCategory());
    dispatch(fetchBrandOptions());
    dispatch(fetchMaterialOptions());
  }, [dispatch]);

  const handleCategoryChange = (e) => {
    setFormData({ ...formData, category: e.value, subCategory: null });
    dispatch(fetchSubCategory(e.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Basic validation
    if (
      !formData.name ||
      !formData.description ||
      !formData.category ||
      !formData.subCategory ||
      !formData.brand ||
      !formData.material
    ) {
      toast.error("Please fill all required fields");
      setIsSaving(false);
      return;
    }

    // Color validation
    if (!formData.color.length) {
      toast.error("Please select at least one color");
      setIsSaving(false);
      return;
    }

    // Size validation
    const { length, width, height, weight } = formData.size;
    if (!length || !width || !height || !weight) {
      toast.error("Please fill all size fields");
      setIsSaving(false);
      return;
    }

    // Price validation
    const { min, max } = formData.price;
    if (!min || !max) {
      toast.error("Please enter price range");
      setIsSaving(false);
      return;
    }

    if (Number(min) > Number(max)) {
      toast.error("Min price cannot be greater than max price");
      setIsSaving(false);
      return;
    }

    // Feature validation
    if (features.some((f) => !f.value.trim())) {
      toast.error("Please fill all features");
      setIsSaving(false);
      return;
    }

    // Banner validation
    if (!bannerImage && !productById) {
      toast.error("Banner image is required");
      setIsSaving(false);
      return;
    }

    // Images validation
    if (images.length === 0 && !productById) {
      toast.error("Please upload product images");
      setIsSaving(false);
      return;
    }
    for (let i = 0; i < catalogues.length; i++) {
      if (
        !catalogues[i].pdfFile ||
        !catalogues[i].bannerImage ||
        !catalogues[i].type
      ) {
        toast.error(`Catalogue ${i + 1} must have all Type, PDF and Banner`);
        setIsSaving(false);
        return;
      }
    }
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("category", formData.category);
    fd.append("subCategory", formData.subCategory);
    fd.append("brand", formData.brand);
    fd.append("material", formData.material);
    const featureList = features.map((f) => f.value).filter(Boolean);
    fd.append("features", JSON.stringify(featureList));
    fd.append("color", JSON.stringify(formData.color));
    fd.append("size", JSON.stringify(formData.size));
    fd.append("price", JSON.stringify(formData.price));

    fd.append(
      "catalogues",
      JSON.stringify(
        catalogues.map((c) => ({
          type: c.type,
          bannerImage: typeof c.bannerImage === "string" ? c.bannerImage : "",
          pdfFile: typeof c.pdfFile === "string" ? c.pdfFile : "",
        })),
      ),
    );

    if (bannerImage) fd.append("bannerImage", bannerImage);
    const existingImages = images
      .filter((img) => typeof img.file === "string")
      .map((img) => img.file);

    fd.append("existingImages", JSON.stringify(existingImages));
    images.forEach((img) => {
      if (img.file instanceof File) {
        fd.append("images", img.file);
      }
    });

    catalogues.forEach((c) => {
      if (c.bannerImage instanceof File) {
        fd.append("catalogueBanners", c.bannerImage);
      }

      if (c.pdfFile instanceof File) {
        fd.append("cataloguePdfs", c.pdfFile);
      }
    });

    if (productById.name) {
      try {
        const actionResult = await dispatch(
          updateProduct({ id: productById._id, formData: fd }),
        );
        if (updateProduct.rejected.match(actionResult)) {
          toast.error(actionResult.payload || "Something went wrong");
        } else {
          toast.success("Product updated successfully!");
          navigate("/product-management");
        }
      } catch (error) {
        console.error("Error updating product:", error);
        toast.error("An error occurred while updating the product.");
      } finally {
        setIsSaving(false);
      }
    } else {
      try {
        const actionResult = await dispatch(createProduct(fd));
        if (createProduct.rejected.match(actionResult)) {
          toast.error(actionResult.payload || "Something went wrong");
        } else {
          toast.success("Product created successfully!");
          setFormData({
            name: "",
            description: "",
            category: null,
            subCategory: null,
            brand: null,
            material: null,
            color: [],
            size: { length: "", width: "", height: "", weight: "" },
            price: { min: "", max: "" },
            features: [],
          });
          navigate("/product-management");
        }
      } catch (error) {
        console.error("Error creating product:", error);
        toast.error("An error occurred while creating the product.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (productId && loadingProductFetch) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-gray-600 text-lg">
          Loading product details...
        </span>
      </div>
    );
  }

  if (productId && errorProductFetch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-red-600 font-medium">
          Failed to load product details
        </p>
        <p className="text-sm text-gray-500">{errorProductFetch}</p>
        <Button onClick={() => fetchProductDetails()}>Retry</Button>
      </div>
    );
  }

  const dropdownFields = [
    {
      key: "category",
      label: "Category",
      placeholder: "Select Category",
      options: categories,
      changeHandler: handleCategoryChange,
    },
    {
      key: "subCategory",
      label: "Sub-Category",
      placeholder: "Select Sub-Category",
      options: subCategories,
    },
    {
      key: "brand",
      label: "Brand",
      placeholder: "Select Brand",
      options: brandOptions,
    },
    {
      key: "material",
      label: "Material",
      placeholder: "Select Material",
      options: materialOptions,
    },
  ];
  const colors = [
    { code: "000000", name: "Black" },
    { code: "1447E6", name: "Blue" },
    { code: "008236", name: "Green" },
    { code: "FF8409", name: "Orange" },
    { code: "FF00AA", name: "Pink" },
    { code: "C0C0C0", name: "Silver" },
    { code: "FFFFFF", name: "White" },
    { code: "FFF70B", name: "Yellow" },
    { code: "808080", name: "Gray" },
    { code: "FF0000", name: "Red" },
  ];

  const catalogueTypes = [
    { name: "Documentation" },
    { name: "CAD Files" },
    { name: "BIM Objects" },
    { name: "3D Models" },
    { name: "Compliance" },
  ];
  const colorItemTemplate = (option) => {
    return (
      <div className="flex items-center gap-2">
        <div
          style={{ backgroundColor: `#${option.code}` }}
          className="w-4 h-4 rounded-full border"
        ></div>
        <span>{option.name}</span>
      </div>
    );
  };
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          size="sm"
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {productById.name
              ? `Edit Product ${productById.name}`
              : "Create New Product"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {productById.name
              ? "Edit a Product to your system"
              : "Add a new Product to your inventory"}
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            {productById.name
              ? "Edit the details you want to edit"
              : "Enter the details for the new product"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-3">
            {/* Product Name */}
            <div className="w-full flex flex-col gap-1">
              <Label htmlFor="name" className="px-3">
                Product Name <span className="text-red-600">*</span>
              </Label>
              <InputText
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter Product name"
                required
                name="name"
                id="name"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
              />
            </div>
            {/* Description */}
            <div className="w-full flex flex-col gap-1">
              <Label htmlFor="description" className="px-3">
                Description <span className="text-red-600">*</span>
              </Label>
              <InputTextarea
                type="text"
                placeholder="Description"
                value={formData.description}
                rows={5}
                required
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
              />
            </div>
            {/* Options */}
            <div className="flex flex-col lg:flex-row gap-3 w-full">
              {dropdownFields.map((field) => (
                <div key={field.key} className="w-full flex flex-col gap-1">
                  <Label htmlFor={field.key} className="px-3">
                    {field.label} <span className="text-red-600">*</span>
                  </Label>

                  <Dropdown
                    placeholder={field.placeholder}
                    options={field.options.map((o) => ({
                      label: o.name,
                      value: o._id,
                    }))}
                    value={formData[field.key]}
                    onChange={(e) => {
                      if (field.changeHandler) {
                        field.changeHandler(e);
                      } else {
                        setFormData({ ...formData, [field.key]: e.value });
                      }
                    }}
                    checkmark
                    className="w-full px-1 text-sm border border-gray-300 rounded-md bg-input shadow-none"
                  />
                </div>
              ))}
              <div className="w-full flex flex-col gap-1">
                <Label className="px-3">
                  Colors <span className="text-red-600">*</span>
                </Label>
                <MultiSelect
                  value={formData.color}
                  options={colors}
                  optionLabel="name"
                  optionValue="name"
                  placeholder="Select Colors"
                  itemTemplate={colorItemTemplate}
                  onChange={(e) => setFormData({ ...formData, color: e.value })}
                  className="w-full text-sm border border-gray-300 rounded-md bg-input shadow-none"
                  maxSelectedLabels={3}
                  showSelectAll
                  selectAllLabel="Select All"
                />
              </div>
            </div>
            {/* Size */}
            <div className="w-full flex flex-col gap-1">
              <Label className="text-xl font-bold">
                Size <span className="text-red-600">*</span>
              </Label>
              <div className="flex flex-col lg:flex-row gap-3 w-full">
                {["length", "width", "height", "weight"].map((field) => (
                  <div key={field} className="w-full flex flex-col gap-1">
                    <Label htmlFor={field} className="px-3 capitalize">
                      {field} <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative">
                      <InputText
                        key={field}
                        type="number"
                        placeholder={`Enter ${field}`}
                        value={formData.size[field]}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "");
                          setFormData({
                            ...formData,
                            size: {
                              ...formData.size,
                              [field]: digitsOnly,
                            },
                          });
                        }}
                        name={field}
                        id={field}
                        className="pr-12 pl-3 w-full py-1.5 border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[clamp(10px,3vw,40px)] sm:text-[clamp(12px,1.9vw,30px)] lg:text-[clamp(10px,1vw,40px)]">
                        {field === "weight" ? "Kg" : "cm"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Price */}
            <div className="w-full flex flex-col gap-1">
              <Label className="text-xl font-bold">
                Price Range <span className="text-red-600">*</span>
              </Label>
              <div className="flex flex-col lg:flex-row gap-3 w-1/2">
                {["min", "max"].map((field) => (
                  <div key={field} className="w-full flex flex-col gap-1">
                    <Label htmlFor={field} className="px-3 capitalize">
                      {field} Price <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative">
                      <InputText
                        key={field}
                        type="number"
                        placeholder={`Enter ${field} Price`}
                        value={formData.price[field]}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "");
                          setFormData({
                            ...formData,
                            price: {
                              ...formData.price,
                              [field]: digitsOnly,
                            },
                          });
                        }}
                        name={field}
                        id={field}
                        className="pr-12 pl-3 w-full py-1.5 border border-gray-300 rounded-md focus:outline-none shadow-none bg-input"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[clamp(10px,3vw,40px)] sm:text-[clamp(12px,1.9vw,30px)] lg:text-[clamp(10px,1vw,40px)]">
                        ₹
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Features */}
            <div className="w-full px-3 flex flex-col gap-2">
              <Label>
                Features <span className="text-red-600">*</span>
              </Label>
              {features.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <InputText
                    placeholder="Enter Feature"
                    value={item.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFeatures((prev) =>
                        prev.map((f, i) => (i === idx ? { ...f, value } : f)),
                      );
                    }}
                    className="w-[300px] px-3 py-1.5 border border-gray-300 rounded-md bg-input"
                  />
                  {/* Delete */}
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setFeatures((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={() => setFeatures((prev) => [...prev, { value: "" }])}
                className="w-fit"
              >
                <Plus /> Add Feature
              </Button>
            </div>
            {/* Banner */}
            <div className="w-full px-3 flex flex-col gap-1">
              <Label>Banner Image</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerImage(e.target.files[0])}
              />
              <p className="text-xs text-gray-500">
                Recommended size: <b>520 x 520</b>
              </p>
              {bannerImage && (
                <img
                  src={
                    typeof bannerImage === "string"
                      ? bannerImage
                      : URL.createObjectURL(bannerImage)
                  }
                  alt="banner preview"
                  className="w-40 h-40 object-cover rounded border"
                />
              )}
            </div>
            {/* Images */}
            <div className="w-full px-3 flex items-start justify-center flex-col gap-3">
              <Label>Product Images</Label>
              {images.map((item, idx) => {
                const imageSrc =
                  item.file instanceof File
                    ? URL.createObjectURL(item.file)
                    : item.file;

                return (
                  <div key={idx} className="flex items-center gap-4 flex-wrap">
                    {/* Upload */}
                    <div className="flex flex-col">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          setImages((prev) =>
                            prev.map((img, i) =>
                              i === idx ? { ...img, file } : img,
                            ),
                          );
                        }}
                      />
                      <span className="text-xs text-gray-500">
                        Recommended size: <b>1400 x 1000</b>
                      </span>
                    </div>
                    {/* Preview */}
                    {imageSrc && (
                      <img
                        src={imageSrc}
                        alt="product"
                        className="w-32 aspect-[1.4/1] object-cover rounded border"
                      />
                    )}
                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-red-500"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                );
              })}
              {/* Add Image */}
              <Button
                type="button"
                onClick={() => {
                  if (images.length >= 10) {
                    toast.info("Maximum 10 images allowed");
                    return;
                  }
                  setImages((prev) => [...prev, { file: null }]);
                }}
              >
                <Plus /> Add Image
              </Button>
            </div>
            {/* Catalogues */}
            <div className="w-full px-3 flex items-start justify-center flex-col gap-3">
              <Label>Catalogues</Label>
              {catalogues.map((item, idx) => (
                <div key={idx} className="flex gap-3 flex-wrap">
                  {/* Dropdown Type */}
                  <div className="w-[200px]">
                    <Dropdown
                      placeholder="Select Type"
                      options={catalogueTypes.map((o) => ({
                        label: o.name,
                        value: o.name,
                      }))}
                      value={item.type}
                      onChange={(e) => {
                        setCatalogues((prev) =>
                          prev.map((c, i) =>
                            i === idx ? { ...c, type: e.value } : c,
                          ),
                        );
                      }}
                      checkmark
                      className="w-full px-1 text-sm border border-gray-300 rounded-md bg-input shadow-none"
                    />
                  </div>
                  {/* PDF Upload */}
                  <div className="flex flex-col">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        setCatalogues((prev) =>
                          prev.map((c, i) =>
                            i === idx ? { ...c, pdfFile: file } : c,
                          ),
                        );
                      }}
                    />
                    <span className="text-xs text-gray-500">Upload PDF</span>
                  </div>
                  {/* PDF Preview */}
                  {item.pdfFile && (
                    <a
                      href={
                        item.pdfFile instanceof File
                          ? URL.createObjectURL(item.pdfFile)
                          : item.pdfFile
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-xs underline"
                    >
                      View PDF
                    </a>
                  )}
                  {/* Banner Upload */}
                  <div className="flex flex-col">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        setCatalogues((prev) =>
                          prev.map((c, i) =>
                            i === idx ? { ...c, bannerImage: file } : c,
                          ),
                        );
                      }}
                    />
                    <span className="text-xs text-gray-500">
                      Upload Banner (Recommended size: <b>430 x 500</b>)
                    </span>
                  </div>
                  {/* Banner Preview */}
                  {item.bannerImage && (
                    <img
                      src={
                        item.bannerImage instanceof File
                          ? URL.createObjectURL(item.bannerImage)
                          : item.bannerImage
                      }
                      alt="catalogue banner"
                      className="w-24 aspect-[4.3/5] object-cover rounded border"
                    />
                  )}
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() =>
                      setCatalogues((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-red-500"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() =>
                  setCatalogues((prev) => [
                    ...prev,
                    { type: "", pdfFile: null, bannerImage: null },
                  ])
                }
              >
                <Plus /> Add Catalogue
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-end border-t pt-6">
            <Link href="/product-management">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <div className="w-fit flex flex-col lg:flex-row gap-5 items-center">
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? productById.name
                    ? "Updating..."
                    : "Creating..."
                  : productById.name
                    ? "Update Product"
                    : "Create Product"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
