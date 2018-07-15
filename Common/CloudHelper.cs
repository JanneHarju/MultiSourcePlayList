
using System;
using Microsoft.WindowsAzure.Storage; // Namespace for Storage Client Library
using Microsoft.WindowsAzure.Storage.File; // Namespace for Azure File storage
using System.Threading.Tasks;
using Microsoft.WindowsAzure.Storage.Blob;

namespace PlayList
{
     public class CloudHelper
    {
        public async static Task<bool> RemoveFileFromCloudFile(string connectionString, string fileFolder, string filename)
        {
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(
                connectionString);

            CloudFileClient fileClient = storageAccount.CreateCloudFileClient();
            // Get a reference to the file share we created previously.
            CloudFileShare share = fileClient.GetShareReference(fileFolder);
            CloudFileDirectory userDir = null;
            // Ensure that the share exists.
            if (await share.ExistsAsync())
            {
                // Get a reference to the root directory for the share.
                CloudFileDirectory rootDir = share.GetRootDirectoryReference();
                // Get a reference to the directory we created previously.
                userDir = rootDir.GetDirectoryReference("audio");
                // Ensure that the directory exists.
                if (await userDir.ExistsAsync())
                {
                    CloudFile removefile = userDir.GetFileReference(filename);
                    await removefile.DeleteIfExistsAsync();
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else
            {
                return false;
            }
        }

        public async static Task<bool> RemoveFileFromCloudBlob(string connectionString, string fileFolder, string filename)
        {
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(
                connectionString);

            CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
            // Get a reference to the file share we created previously.
            CloudBlobContainer container = blobClient.GetContainerReference(fileFolder);
            // Ensure that the share exists.
            if (await container.ExistsAsync())
            {
                CloudBlob removefile = container.GetBlockBlobReference(filename);
                await removefile.DeleteIfExistsAsync();
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}