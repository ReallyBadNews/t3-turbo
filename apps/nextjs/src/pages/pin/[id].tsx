import { PinPost } from "@/components/Pin";
import { useRouter } from "next/router";
import { api } from "../../utils/api";

export default function PinPage() {
  const {
    query: { id = "" },
  } = useRouter();

  console.log("[id].tsx query", id);

  const { data, error, isLoading } = api.pin.byId.useQuery(id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <ul className="lg:col-span-9 xl:col-span-6">
      <PinPost data={data} />
    </ul>
  );
}
