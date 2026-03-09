import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/Card";
import { useDispatch, useSelector } from "react-redux";

import { AlertCircle, Edit, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Button } from "../../ui/buttons";
import {
  createCategory,
  deleteCategory,
  fetchCategory,
  updateCategory,
} from "./categoriesAPI";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { InputText } from "primereact/inputtext";
import { useLocation } from "wouter";

export default function CategoryManagement() {
  const {
    categories = [],
    error,
    loading,
  } = useSelector((state) => state.category);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null); // holds full object
  const [bannerImage, setBannerImage] = useState(null);
  const [, navigate] = useLocation();

  const handleDeleteClick = (item) => {
    setCategoryToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        const actionResult = await dispatch(
          deleteCategory(categoryToDelete._id),
        );
        if (deleteCategory.rejected.match(actionResult)) {
          toast.error(actionResult.payload || "Something went wrong");
        } else {
          toast.success("Category deleted successfully!");
          setDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("An error occurred while deleting the category.");
      }
    }
  };

  const dispatch = useDispatch();
  const fetchCategoriesOnce = useCallback(() => {
    dispatch(fetchCategory());
  }, [dispatch]);

  // 👇 useEffect will only run once and call the fetch function
  useEffect(() => {
    fetchCategoriesOnce();
  }, [fetchCategoriesOnce]);

  const handleSaveCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Please enter category name");
      return;
    }
    const formData = new FormData();
    formData.append("name", newCategory);

    if (bannerImage) {
      formData.append("bannerImage", bannerImage);
    }

    if (!editingCategory) {
      formData.append("createdBy", user._id);
    }
    try {
      let result;

      if (editingCategory) {
        // 🔁 EDIT MODE
        result = await dispatch(
          updateCategory({
            id: editingCategory._id,
            data: formData,
          }),
        );

        if (updateCategory.rejected.match(result)) {
          toast.error(result.payload || "Failed to update category");
          return;
        }

        toast.success("Category updated successfully!");
      } else {
        // ➕ ADD MODE
        result = await dispatch(createCategory(formData));

        if (createCategory.rejected.match(result)) {
          toast.error(result.payload || "Failed to create category");
          return;
        }

        toast.success("Category added successfully!");
      }
      setNewCategory("");
      setIsAdding(false);
      setEditingCategory(null);
    } catch (err) {
      toast.error("Unexpected error occurred");
      console.error(err);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 lg:flex-row justify-between lg:items-center mb-6">
        <div className="w-full">
          <h1 className="text-2xl font-semibold text-gray-900">Category</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your all categoies effectively.
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Product Categories List</CardTitle>
          <CardDescription>
            View and Manage all categories option
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="w-full text-center py-10">
              <p className="mt-2 text-sm text-gray-600">
                Loading categories...
              </p>
            </div>
          ) : error ? (
            <div className="w-full text-center py-10">
              <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
              <h3 className="mt-2 text-sm font-semibold text-red-500">
                Error: {error}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There was an error fetching categories. Please try again
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Banner Image</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAdding && (
                  <TableRow>
                    <TableCell className="w-[60%]">
                      <InputText
                        type="text"
                        className="w-full border py-2 px-3 text-start border-gray-300 rounded-md shadow-none text-sm"
                        placeholder="Enter Category Name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBannerImage(e.target.files[0])}
                      />
                      <p className="text-xs text-gray-500">
                        Recommended size: <b>315 x 420</b>
                      </p>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-4">
                      <Button
                        onClick={handleSaveCategory}
                        variant="default"
                        size="sm"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAdding(false);
                          setNewCategory("");
                          setEditingCategory(null);
                          setBannerImage(null);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
                {categories
                  .filter((item) => item._id !== editingCategory?._id)
                  .map((item, index) => (
                    <TableRow key={index}>
                      <TableCell
                        className="font-medium text-blue-600 cursor-pointer hover:underline"
                        onClick={() =>
                          navigate(
                            `/category-management/${item.name}/${item._id}`,
                          )
                        }
                      >
                        {item.name}
                      </TableCell>
                      <TableCell>
                        {item.bannerImage && (
                          <a
                            href={item.bannerImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer hover:underline"
                          >
                            View Image
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingCategory(item);
                            setNewCategory(item.name);
                            setIsAdding(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the Order Number{" "}
              {categoryToDelete ? `${categoryToDelete.name}` : ""} ? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={confirmDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
