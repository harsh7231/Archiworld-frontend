import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Edit, Plus, Search, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { InputText } from "primereact/inputtext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/Card";
import { Button } from "../../ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Link, useLocation } from "wouter";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Paginator } from "primereact/paginator";
import { template1 } from "../../ui/pagination";
import { deleteProduct, getProductsByUserId } from "./ProductAPI";

export default function ProductManagement() {
  const dispatch = useDispatch();
  const {
    products = [],
    loading,
    error,
  } = useSelector((state) => state.product);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const debounceTimeout = useRef(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [rows, setRows] = useState(25);

  // Update debouncedSearchTerm with a delay
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000); // 500ms debounce delay
  }, [searchTerm]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    dispatch(
      getProductsByUserId({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        rows,
      }),
    )
      .unwrap()
      .then((res) => {
        // ✅ Use API response instead of stale state dependency
        setTotalRecords(res?.totalCount || 0);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
      });
  }, [dispatch, debouncedSearchTerm, currentPage, rows]);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (productToDelete) {
        const actionResult = await dispatch(deleteProduct(productToDelete._id));
        if (deleteProduct.rejected.match(actionResult)) {
          toast.error(actionResult.payload || "Something went wrong");
        } else {
          toast.success("Product deleted successfully!");
          setDeleteDialogOpen(false);
          setProductToDelete(null);
        }
      }
    } catch (error) {
      console.error("Error deleting Product:", error);
      toast.error("An error occurred while deleting the Product.");
    }
  };

  return (
    <>
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your products effectively.
            </p>
          </div>
          <Link href="/create-product">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Product List</CardTitle>
            <CardDescription>View and Manage all your products</CardDescription>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400 h-5 w-5" />
              </div>
              <InputText
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none shadow-none bg-white"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10">
                <p>Loading products...</p>
              </div>
            ) : error ? (
              <div className="w-full text-center py-10">
                <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
                <h3 className="mt-2 text-sm font-semibold text-red-500">
                  Error: {error}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  There was an error fetching products. Please try again later.
                </p>
              </div>
            ) : products.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[15%]">Name</TableHead>
                    <TableHead className="w-[15%]">Category</TableHead>
                    <TableHead className="w-[20%]">Sub Category</TableHead>
                    <TableHead className="w-[20%]">Material</TableHead>
                    <TableHead className="w-[15%]">Brand</TableHead>
                    <TableHead className="w-[15%]">Vendor</TableHead>
                    <TableHead className="text-right w-[10%]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item?.name}
                      </TableCell>
                      <TableCell>{item?.category?.name}</TableCell>
                      <TableCell>{item?.subCategory?.name}</TableCell>
                      <TableCell>{item?.material?.name}</TableCell>
                      <TableCell>{item?.brand?.name}</TableCell>
                      <TableCell>{item?.user?.name}</TableCell>
                      <TableCell className="text-right flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigate(`/edit-product/${item?._id}`);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="w-full text-center py-10">
                <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  No Product found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "No Product match your search criteria."
                    : "Get started by creating a new Product."}
                </p>
                <div className="mt-6">
                  <Link href="/create-product">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Product
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
          {totalRecords > 25 && (
            <CardFooter className="flex justify-between border-t pt-6">
              <Paginator
                template={template1}
                first={currentPage * rows}
                rows={rows}
                totalRecords={totalRecords}
                onPageChange={(e) => {
                  setCurrentPage(e.first / e.rows); // Correctly set page number
                  setRows(e.rows);
                }}
                className="flex gap-2 ml-auto justify-end"
              />
            </CardFooter>
          )}
        </Card>
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this Product"
                {productToDelete?.name}
                "?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
