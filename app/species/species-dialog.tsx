"use client";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/client-utils";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesDialog({ species }: { species: Species ; userId: string}) {
  const [open, setOpen] = useState<boolean>(false);
  const [authorName, setAuthorName] = useState<string | null>(null);
  useEffect(() => {
    const fetchAuthor = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", species.author)
        .single();

      setAuthorName(data?.display_name ?? null);
    };
    void fetchAuthor();
  }, [species.author]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full">Learn More</Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{species.scientific_name}</DialogTitle>
          {species.common_name && <DialogDescription>{species.common_name}</DialogDescription>}
        </DialogHeader>

        {species.image && (
          <div className="relative h-64 w-full overflow-hidden rounded">
            <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold">Kingdom</p>
            <p>{species.kingdom}</p>
          </div>
          <div>
            <p className="font-semibold">Total population</p>
            <p>{species.total_population ? species.total_population.toLocaleString() : "Unknown"}</p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="font-semibold">Description</p>
          <DialogDescription>
            {species.description ?? "No description provided."}
          </DialogDescription>
        </div>
        <div>
          <p className="font-semibold">Submitted by
          <DialogDescription>
            {authorName}
          </DialogDescription>
          </p>
        </div>

      </DialogContent>
    </Dialog>
  );
}
