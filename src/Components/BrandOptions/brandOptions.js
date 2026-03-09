import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrandOptions,
  createBrandOption,
  updateBrandOption,
  deleteBrandOption,
} from "./brandOptionsAPI";
import { toast } from "react-toastify";
import { Button } from "../../ui/buttons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { InputText } from "primereact/inputtext";
import { Edit, Trash2, Plus, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

export default function BrandOptions() {
  const dispatch = useDispatch();
  const {
    brandOptions = [],
    loading,
    error,
  } = useSelector((state) => state.brandOption);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBrandOption, setEditingBrandOption] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandOptionToDelete, setBrandOptionToDelete] = useState(null);
  const [newBrandOption, setNewBrandOption] = useState("");

  const fetchBrandOptionsOnce = useCallback(() => {
    dispatch(fetchBrandOptions());
  }, [dispatch]);

  // 👇 useEffect will only run once and call the fetch function
  useEffect(() => {
    fetchBrandOptionsOnce();
  }, [fetchBrandOptionsOnce]);

  const handleDeleteClick = (item) => {
    setBrandOptionToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (brandOptionToDelete) {
      try {
        const actionResult = await dispatch(
          deleteBrandOption(brandOptionToDelete._id),
        );
        if (deleteBrandOption.rejected.match(actionResult)) {
          toast.error(actionResult.payload || "Something went wrong");
        } else {
          toast.success("Brand Option deleted successfully!");
          setDeleteDialogOpen(false);
          setBrandOptionToDelete(null);
        }
      } catch (error) {
        console.error("Error deleting brand Option:", error);
        toast.error("An error occurred while deleting the Brand Option.");
      }
    }
  };

  const handleSave = async () => {
    if (!newBrandOption.trim()) {
      toast.error("Please enter brand option name");
      return;
    }

    let result;

    if (editingBrandOption) {
      result = await dispatch(
        updateBrandOption({ id: editingBrandOption._id, name: newBrandOption }),
      );

      if (updateBrandOption.rejected.match(result)) {
        toast.error(result.payload);
        return;
      }

      toast.success("Brand Option updated");
    } else {
      result = await dispatch(createBrandOption({ name: newBrandOption }));

      if (createBrandOption.rejected.match(result)) {
        toast.error(result.payload);
        return;
      }

      toast.success("Sub-category added");
    }

    setNewBrandOption("");
    setIsAdding(false);
    setEditingBrandOption(null);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 lg:flex-row justify-between lg:items-center mb-6">
        <div className="w-full">
          <h1 className="text-2xl font-semibold text-gray-900">
            Brand Options
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your brand options effectively.
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand Options
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Product Brand Option List</CardTitle>
          <CardDescription>View and Manage brand options</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full text-center py-10">
              <p className="mt-2 text-sm text-gray-600">
                Loading brand options...
              </p>
            </div>
          ) : error ? (
            <div className="w-full text-center py-10">
              <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
              <h3 className="mt-2 text-sm font-semibold text-red-500">
                Error: {error}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There was an error fetching brand options. Please try again
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand Name</TableHead>
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
                        value={newBrandOption}
                        onChange={(e) => setNewBrandOption(e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-4">
                      <Button onClick={handleSave} variant="default" size="sm">
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAdding(false);
                          setNewBrandOption("");
                          setEditingBrandOption(null);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
                {brandOptions
                  .filter((item) => item._id !== editingBrandOption?._id)
                  .map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="font-medium text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingBrandOption(item);
                            setNewBrandOption(item.name);
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
              {brandOptionToDelete ? `${brandOptionToDelete.name}` : ""} ? This
              action cannot be undone.
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
