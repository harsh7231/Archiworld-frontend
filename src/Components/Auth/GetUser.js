import React, { useEffect, useState } from "react";
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
import { fetchUsers, inActiveUser } from "./authAPI";
import { toast } from "react-toastify";

export default function GetUser() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userrToDelete, setUserToDelete] = useState(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    const sortByIsActiveAndName = (a, b) => {
      // First sort by isActive (true > false)
      if (b.isActive !== a.isActive) {
        return b.isActive - a.isActive;
      }
      // If isActive is the same, sort by name ascending
      return a.name?.localeCompare(b.name);
    };

    if (searchTerm === "") {
      setFilteredUsers([...(users || [])].sort(sortByIsActiveAndName));
    } else {
      setFilteredUsers(
        users
          .filter(
            (item) =>
              item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item?.mobile?.includes(searchTerm) ||
              item?.username?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .sort(sortByIsActiveAndName)
      );
    }
  }, [searchTerm, users]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (userrToDelete) {
        const actionResult = await dispatch(inActiveUser(userrToDelete._id));
        if (inActiveUser.rejected.match(actionResult)) {
          toast.error(actionResult.payload || "Something went wrong");
        } else {
          toast.success("User deleted successfully!");
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("An error occurred while deleting the user.");
    }
  };

  return (
    <>
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your users effectively.
            </p>
          </div>
          <Link href="/create-user">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Users List</CardTitle>
            <CardDescription>View and Manage all your users</CardDescription>
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
                <p>Loading users...</p>
              </div>
            ) : error ? (
              <div className="w-full text-center py-10">
                <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
                <h3 className="mt-2 text-sm font-semibold text-red-500">
                  Error: {error}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  There was an error fetching users. Please try again later.
                </p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[15%]">Name</TableHead>
                    <TableHead className="w-[15%]">Contact Person</TableHead>
                    <TableHead className="w-[20%]">Email</TableHead>
                    <TableHead className="w-[20%]">Mobile</TableHead>
                    <TableHead className="w-[15%]">User Name</TableHead>
                    <TableHead className="w-[15%]">Address</TableHead>
                    <TableHead className="w-[15%]">Rating</TableHead>
                    <TableHead className="text-right w-[10%]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((item, index) => (
                    <TableRow
                      key={index}
                    >
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.contactPerson}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>{item.mobile}</TableCell>
                      <TableCell>{item.username}</TableCell>
                      <TableCell>{item?.address}</TableCell>
                      <TableCell>{item?.subscription?.name}</TableCell>
                      <TableCell className="text-right flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            localStorage.setItem(
                              "userToEdit",
                              JSON.stringify(item)
                            );
                            navigate("/edit-user");
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        {item.name !== user?.name && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteClick(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="w-full text-center py-10">
                <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  No User found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "No user match your search criteria."
                    : "Get started by creating a new User."}
                </p>
                <div className="mt-6">
                  <Link href="/create-user">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create User
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to inActive the User "
                {userrToDelete?.name}
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
