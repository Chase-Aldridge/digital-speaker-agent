// Runs the API server and the Vite dev server together with one command.
// `bun run dev`
export {};

const procs = [
  { name: "api", cmd: ["bun", "--watch", "server/index.ts"] },
  { name: "web", cmd: ["bunx", "vite"] },
];

const children = procs.map(({ name, cmd }) => {
  const proc = Bun.spawn(cmd, {
    stdout: "inherit",
    stderr: "inherit",
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  console.log(`[dev] started ${name} (pid ${proc.pid})`);
  return proc;
});

const shutdown = () => {
  for (const c of children) c.kill();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await Promise.all(children.map((c) => c.exited));
