import T1Chart from "./components/T1Chart";
import { fetchT1History } from "./lib/fetchT1History";
import { T1DataPoint } from "./store/t1Slice";

export default async function Home(props: any) {
  const initialData: T1DataPoint[] = await fetchT1History();

  return (
      <main style={{ padding: '2rem' }}>
        <h1>T1 Dashboard</h1>
        <T1Chart initialData={initialData} />
      </main>
  )
}