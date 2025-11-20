// api/debug-project-data.ts
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { projectData } = req.body;
  
  const debugInfo = {
    hasProjectData: !!projectData,
    hasMainImage: !!projectData?.mainImage,
    hasBase64: !!projectData?.mainImage?.base64,
    base64Length: projectData?.mainImage?.base64?.length,
    mimeType: projectData?.mainImage?.mimeType,
    storyboardScenes: projectData?.storyboard?.scenes?.length
  };

  console.log('🔍 Debug - Project Data Structure:', debugInfo);

  res.json({
    success: true,
    debug: debugInfo
  });
}