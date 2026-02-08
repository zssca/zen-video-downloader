import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <Empty className="min-h-[420px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Loading...</EmptyTitle>
        <EmptyDescription>Preparing the downloader.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
