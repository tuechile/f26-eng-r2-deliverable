"use client";
/*
Note: "use client" is a Next.js App Router directive that tells React to render the component as
a client component rather than a server component. This establishes the server-client boundary,
providing access to client-side functionality such as hooks and event handlers to this component and
any of its imported children. Although the SpeciesCard component itself does not use any client-side
functionality, it is beneficial to move it to the client because it is rendered in a list with a unique
key prop in species/page.tsx. When multiple component instances are rendered from a list, React uses the unique key prop
on the client-side to correctly match component state and props should the order of the list ever change.
React server components don't track state between rerenders, so leaving the uniquely identified components (e.g. SpeciesCard)
can cause errors with matching props and state in child components if the list order changes.
*/
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import Image from "next/image";

import { useRouter } from "next/navigation";

import { Trash2 } from "lucide-react"; // I need the trashcan and edit emoji
import EditSpeciesDialog from "./edit-species-dialog";
import SpeciesDialog from "./species-dialog";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesCard({ species, userId }: { species: Species; userId: string }) {
  const router = useRouter();
  // accessing the supabase to delete
  const handleDelete = async () => {
    if (!confirm(`Delete ${species.scientific_name}? This cannot be undone.`)) {
      return;
    }

    const supabase = createBrowserSupabaseClient();

// try to see if any error deleting
    const { error } = await supabase.from("species").delete().eq("id", species.id);
    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    router.refresh();

    return toast({
      title: "Species deleted",
      description: `Successfully deleted ${species.scientific_name}.`,
    });
  };

  return (
    <div className="m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow">
      {species.image && (
        <div className="relative h-40 w-full">
          <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
        </div>
      )}
      <h3 className="mt-3 text-2xl font-semibold">{species.scientific_name}</h3>
      <h4 className="text-lg font-light italic">{species.common_name}</h4>
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
        {species.description
          ? species.description.length > 150
            ? species.description.slice(0, 150).trim() + "..."
            : species.description
          : ""}
      </p>

      {/* delete and edit button */}
      <SpeciesDialog species={species} />
      {species.author === userId && (
        <div className="mt-3 flex gap-2">
          <EditSpeciesDialog species={species} />
          <Button variant="destructive" className="flex-1" onClick={() => void handleDelete()}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
