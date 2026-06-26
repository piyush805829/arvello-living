import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file was uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean up filename to prevent character issues
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const bucketName = 'arvello-media';

    // Attempt the upload to Supabase Storage
    let { error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      });

    // If bucket doesn't exist error (usually 'Bucket not found' or similar)
    if (error && (error.message.includes('not found') || error.message.includes('does not exist') || (error as { status?: number }).status === 404)) {
      console.log(`Bucket ${bucketName} not found, attempting to create it...`);
      const { error: createBucketError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB limit
      });

      if (!createBucketError) {
        // Retry the upload
        const retryResult = await supabaseAdmin.storage
          .from(bucketName)
          .upload(filename, buffer, {
            contentType: file.type,
            cacheControl: '31536000',
            upsert: false,
          });
        error = retryResult.error;
      } else {
        console.error('Failed to auto-create storage bucket:', createBucketError);
        return NextResponse.json(
          { success: false, error: `Storage bucket '${bucketName}' does not exist and could not be created automatically: ${createBucketError.message}` },
          { status: 500 }
        );
      }
    }

    if (error) {
      console.error('Supabase storage upload error:', error);
      return NextResponse.json(
        { success: false, error: `Upload to Supabase failed: ${error.message}` },
        { status: 500 }
      );
    }

    // Retrieve public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error('Upload endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during upload' },
      { status: 500 }
    );
  }
}
