import { api } from "@/utils/api";
import type { GetStaticPropsContext } from "next";

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const { id } = params;

  const pin = await api.pin.byId.useQuery({ id: id as string });

  return {
    props: {},
    revalidate: 1,
  };
}
