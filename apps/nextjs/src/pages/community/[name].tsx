import { useRouter } from "next/router";
import { api } from "../../utils/api";

export default function CommunityPage() {
  const router = useRouter();
  const name = router.query.name as string;

  const { data, error, isLoading } = api.community.byName.useQuery(name);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{`Error: ${error.message}`}</div>;
  }

  if (!data) {
    return <div>Not found</div>;
  }

  return (
    <ul className="lg:col-span-9 xl:col-span-6">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </ul>
  );
}
