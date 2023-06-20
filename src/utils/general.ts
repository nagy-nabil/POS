import { payloadSchema } from "@/types/entities";
import { type z } from "zod";

type Payload = z.infer<typeof payloadSchema>;
export function parseJwt(token: string): Payload {
  const base64Url = token.split(".")[1];
  if (!base64Url) throw new Error("base64Url shouldn't be empty");

  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  const payload = JSON.parse(jsonPayload) as Payload;
  payloadSchema.parse(payload);
  return payload;
}
