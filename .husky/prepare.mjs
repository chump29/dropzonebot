import process from "node:process"

if (process.env.CI === "true") {
  console.info("Skipping prepare hook...")

  process.exit(0)
}

await import("husky")
