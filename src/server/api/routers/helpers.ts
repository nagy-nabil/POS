import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getBlobSasUri } from "@/utils/imagesUpload";

export const helpersRouter = createTRPCRouter({
  uploadImage: protectedProcedure.mutation(() => {
    return getBlobSasUri(Date.now().toString());
  }),
});
