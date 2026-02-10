import { spawn } from "node:child_process";

type RunOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export function run(
  cmd: string,
  args: string[],
  opts?: RunOptions
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    let settled = false;
    if (opts?.signal?.aborted) {
      resolve({ code: 1, stdout: "", stderr: "Cancelled." });
      return;
    }

    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";
    let killedByAbort = false;
    let killedByTimeout = false;

    const timeoutMs = opts?.timeoutMs ?? 0;
    const timer =
      timeoutMs > 0
        ? setTimeout(() => {
            killedByTimeout = true;
            child.kill("SIGKILL");
          }, timeoutMs)
        : null;

    const onAbort = () => {
      killedByAbort = true;
      child.kill("SIGKILL");
    };
    opts?.signal?.addEventListener("abort", onAbort, { once: true });

    child.stdout.on("data", (d) => (stdout += d.toString("utf8")));
    child.stderr.on("data", (d) => (stderr += d.toString("utf8")));

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      opts?.signal?.removeEventListener("abort", onAbort);

      if (killedByAbort) stderr = `${stderr}\nCancelled.`.trim();
      if (killedByTimeout)
        stderr = `${stderr}\nTimed out after ${Math.round(timeoutMs / 1000)}s.`.trim();

      resolve({ code: code ?? 1, stdout, stderr });
    });

    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      opts?.signal?.removeEventListener("abort", onAbort);
      resolve({ code: 1, stdout, stderr: err.message });
    });
  });
}
