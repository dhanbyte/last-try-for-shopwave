import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string
    const folder = formData.get('folder') as string || '/'

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: 'No file provided' 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const uploadPath = `${folder}/${fileName || file.name}`.replace('//', '/')
    
    const uploadResponse = await fetch(`https://storage.bunnycdn.com/shopwave${uploadPath}`, {
      method: 'PUT',
      headers: {
        'AccessKey': process.env.BUNNY_STORAGE_PASSWORD!,
        'Content-Type': file.type
      },
      body: buffer
    })

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`)
    }

    const cdnUrl = `${process.env.NEXT_PUBLIC_BUNNY_CDN_URL}${uploadPath}`

    return NextResponse.json({
      success: true,
      url: cdnUrl,
      name: fileName || file.name
    })

  } catch (error) {
    console.error('Bunny upload error:', error)
    return NextResponse.json({
      success: false,
      message: 'Upload failed'
    }, { status: 500 })
  }
}