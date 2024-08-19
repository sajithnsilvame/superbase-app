
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import supabase  from "../utils/superbase-conf.js";
import Swal from "sweetalert2";

function App() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState(null);

  useEffect(() => {
    getNotes()
  }, []);

  const handleCreateNote = (event) => {
    setNote(event.target.value);
  }

  async function createNote() {
    if (!note.trim()) {
      Swal.fire("Opps!", "Note cannot be empty!", "warning");
      return;
    }

    try {
      const { error } = await supabase
        .from("notes")
        .insert({ note })
        .single();
        
        getNotes();
      if (error) throw error;
      Swal.fire("Created!", "Note created successfully!", "success");
      setNote(""); // Clear the input after successful creation
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  async function updateNote() {
    if (!note.trim()) {
      alert("Note cannot be empty!");
      return;
    }

    try {
      const { error } = await supabase
        .from("notes")
        .update({ note })
        .eq("id", currentNoteId);

      if (error) throw error;

      getNotes();
      Swal.fire("Updated!", "Note updated successfully!", "success");
      setNote(""); // Clear the input after successful update
      setIsEditing(false);
      setCurrentNoteId(null);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  async function getNotes() {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .limit(10);
      if (error) throw error;
      if (data != null) {
        setNotes(data);
        
        console.log(data);
      }
    } catch (error) {
      alert(error.message);
    }
  }

  const handleEdit = (noteId, noteText) => {
    setIsEditing(true);
    setCurrentNoteId(noteId);
    setNote(noteText);
  };

  const handleDelete = async (id) => {
    console.log("Deleting note with id:", id);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this note?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from("notes").delete().eq("id", id);

        if (error) throw error;

        // Update the notes state to remove the deleted note
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));

        Swal.fire("Deleted!", "The note has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", error.message, "error");
      }
    }
  };


  return (
    <>
      <div className="bg-background text-foreground min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-md w-full p-4 bg-card shadow-lg rounded-lg">
          <input
            type="text"
            placeholder="Type your note here"
            value={note}
            onChange={handleCreateNote}
            className="w-full px-3 py-2 rounded border border-input focus:outline-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={isEditing ? updateNote : createNote}
              className={`w-full p-2 rounded ${
                isEditing ? "bg-gray-900" : "bg-gray-900"
              } text-white hover:${isEditing ? "bg-gray-950" : "bg-gray-950"}`}
            >
              {isEditing ? "Update" : "Create"}
            </button>
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentNoteId(null);
                  setNote(""); // Clear the input
                }}
                className="w-full p-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto bg-white mt-4 p-5 shadow-lg rounded-lg mx-10">
          <table className="w-full max-w-lg md:max-w-xl lg:max-w-2xl mx-auto mt-4 ">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-4 py-2 text-left">Note</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note, id) => (
                <tr key={id} className="border-b border-gray-200">
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {note.note}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-4">
                      <button
                        className="text-secondary hover:text-secondary/80"
                        title="Edit"
                        onClick={() => handleEdit(note.id, note.note)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-destructive hover:text-destructive/80"
                        title="Delete"
                        onClick={() => handleDelete(note.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default App
