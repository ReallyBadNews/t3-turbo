import { useRouter } from "next/router";
import { PinPost } from "../../components/Pin";
import { api } from "../../utils/api";

export default function PinPage() {
  const {
    query: { id = "" },
  } = useRouter();

  const { data, error, isLoading } = api.pin.byId.useQuery(id as string);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{`Error: ${error.message}`}</div>;
  }

  return (
    <ul className="lg:col-span-9 xl:col-span-6">
      <PinPost data={data} />
    </ul>
  );
}
