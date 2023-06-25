import { env } from "@/env.mjs";
import {
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

/**
 * What is azure SAS(shared access signature) token?
 * BY AI
 * An Azure Storage SAS (Shared Access Signature) token is a token that grants restricted
 * access to Azure Storage resources (blobs, containers, queues, tables, and files) without
 * exposing your account key. A SAS token allows specific access to a storage resource for a
 * specific period of time.
 * *They are a secure way to grant limited access to your storage resources without sharing your account keys.*
 * * When you create a SAS, you specify its constraints, including which Azure Storage resources a client is allowed to access, what permissions they have on those resources, and how long the SAS is valid
 */

/**
 * @link https://learn.microsoft.com/en-us/azure/storage/blobs/sas-service-create-javascript
 */
const helper = () => {
  // create credentail and init blob serviceClient
  const sharedKeyCredential = new StorageSharedKeyCredential(
    env.AzureStorageAaccountName,
    env.AzureStorageAccountKey
  );
  const blobServiceClient = new BlobServiceClient(
    `https://${env.AzureStorageAaccountName}.blob.core.windows.net`,
    sharedKeyCredential
  );

  // get ref to the container
  const containerClient = blobServiceClient.getContainerClient(
    env.AzureContainerName
  );

  return {
    containerClient,
    sharedKeyCredential,
  };
};

/**
 * Create a service SAS for a blob
 * @link https://learn.microsoft.com/en-us/azure/storage/blobs/sas-service-create-javascript
 * @param blobName string
 * @returns url
 */
export function getBlobSasUri(blobName: string) {
  const { containerClient, sharedKeyCredential } = helper();
  //get new blob ref
  const blobClient = containerClient.getBlockBlobClient(blobName);
  // const blobPermissions = BlobSASPermissions.parse("crw");
  const blobPermissions = new BlobSASPermissions();
  blobPermissions.write = true;
  blobPermissions.read = true;
  console.log(blobPermissions);
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 5); // set to expire in 2 mins

  // create sas access
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: containerClient.containerName,
      blobName: blobClient.name,
      permissions: blobPermissions,
      expiresOn: expiryTime,
    },
    sharedKeyCredential
  ).toString();

  return { sasUrl: blobClient.url + "?" + sasToken, blobUrl: blobClient.url };
}
