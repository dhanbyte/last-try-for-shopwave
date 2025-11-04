import { NextRequest, NextResponse } from 'next/server'
import ImageKit from 'imagekit'

const imagekit = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT 
  ? new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
    })
  : null

export async function POST(request: NextRequest) {
  try {
    if (!imagekit) {
      return NextResponse.json({ 
        success: false, 
        message: 'ImageKit not configured' 
      }, { status: 500 })
    }

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

    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: fileName || file.name,
      folder: folder
    })

    return NextResponse.json({
      success: true,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name
    })

  } catch (error) {
    console.error('ImageKit upload error:', error)
    return NextResponse.json({
      success: false,
      message: 'Upload failed'
    }, { status: 500 })
  }
}