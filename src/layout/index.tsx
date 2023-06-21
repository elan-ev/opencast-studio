import { Header } from "./header";


export const Root: React.FC = () => (
  <div css={{
    display: "flex",
    flexDirection: "column",
    height: "100%",
  }}>
    <Header />
    <main>Main</main>
  </div>
);
