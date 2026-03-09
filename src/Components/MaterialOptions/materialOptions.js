import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMaterialOptions,
  createMaterialOption,
  updateMaterialOption,
  deleteMaterialOption,
} from "./materialOptionsAPI";
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

export default function MaterialOptions() {
  const dispatch = useDispatch();
  const {
    materialOptions = [],
    loading,
    error,
  } = useSelector((state) => state.materialOption);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMaterialOption, setEditingMaterialOption] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialOptionToDelete, setMaterialOptionToDelete] = useState(null);
  const [newMaterialOption, setNewMaterialOption] = useState("");

  const fetchMaterialOptionsOnce = useCallback(() => {
    dispatch(fetchMaterialOptions());
  }, [dispatch]);

  // 👇 useEffect will only run once and call the fetch function
  useEffect(() => {
    fetchMaterialOptionsOnce();
  }, [fetchMaterialOptionsOnce]);

  const handleDeleteClick = (item) => {
    setMaterialOptionToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (materialOptionToDelete) {
      try {
        const actionResult = await dispatch(
          deleteMaterialOption(materialOptionToDelete._id),
        );
        if (deleteMaterialOption.rejected.match(actionResult)) {
          toast.error(actionResult.payload || "Something went wrong");
        } else {
          toast.success("Material option deleted successfully!");
          setDeleteDialogOpen(false);
          setMaterialOptionToDelete(null);
        }
      } catch (error) {
        console.error("Error deleting material option:", error);
        toast.error("An error occurred while deleting the material option.");
      }
    }
  };

  const handleSave = async () => {
    if (!newMaterialOption.trim()) {
      toast.error("Please enter material option name");
      return;
    }

    let result;

    if (editingMaterialOption) {
      result = await dispatch(
        updateMaterialOption({
          id: editingMaterialOption._id,
          name: newMaterialOption,
        }),
      );

      if (updateMaterialOption.rejected.match(result)) {
        toast.error(result.payload);
        return;
      }

      toast.success("Material option updated");
    } else {
      result = await dispatch(
        createMaterialOption({ name: newMaterialOption }),
      );

      if (createMaterialOption.rejected.match(result)) {
        toast.error(result.payload);
        return;
      }

      toast.success("Material option added");
    }

    setNewMaterialOption("");
    setIsAdding(false);
    setEditingMaterialOption(null);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 lg:flex-row justify-between lg:items-center mb-6">
        <div className="w-full">
          <h1 className="text-2xl font-semibold text-gray-900">
            Material Options
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your material options effectively.
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" />
          Add Material Option
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Product Material Options List</CardTitle>
          <CardDescription>
            View and Manage material options
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full text-center py-10">
              <p className="mt-2 text-sm text-gray-600">
                Loading material options...
              </p>
            </div>
          ) : error ? (
            <div className="w-full text-center py-10">
              <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
              <h3 className="mt-2 text-sm font-semibold text-red-500">
                Error: {error}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There was an error fetching material options. Please try again
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material Option Name</TableHead>
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
                        placeholder="Enter Material Option Name"
                        value={newMaterialOption}
                        onChange={(e) => setNewMaterialOption(e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-4">
                      <Button onClick={handleSave} variant="default" size="sm">
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAdding(false);
                          setNewMaterialOption("");
                          setEditingMaterialOption(null);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
                {materialOptions
                  ?.filter((item) => item._id !== editingMaterialOption?._id)
                  ?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item?.name}</TableCell>
                      <TableCell className="font-medium text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingMaterialOption(item);
                            setNewMaterialOption(item?.name);
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
              {materialOptionToDelete ? `${materialOptionToDelete.name}` : ""} ?
              This action cannot be undone.
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
