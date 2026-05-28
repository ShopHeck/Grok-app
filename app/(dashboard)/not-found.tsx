import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 flex flex-col items-center gap-4 text-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Not Found</h2>
            <p className="text-sm text-muted-foreground mt-1">
              The page or resource you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
