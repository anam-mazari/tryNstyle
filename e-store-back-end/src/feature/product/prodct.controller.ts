import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import { ProductService } from 'src/core/services/product/product.service';
import {
  CreateProductDto,
  UpdateProductDto,
} from 'src/core/services/product/create-product.dto';
import { ListProductsQueryDto } from 'src/core/services/product/list-products-query.dto';

const GLB_OUTPUT_DIR = process.env.GLB_OUTPUT_DIR || '/app/public/models';

@Controller('product')
export class ProductController {
  constructor(private readonly ProductService: ProductService) {}

  @Get()
  findMany(@Query() query: ListProductsQueryDto) {
    return this.ProductService.findMany(query);
  }

  @Get('filters')
  getProductFilters() {
    return this.ProductService.getProductFilterMetadata();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ProductService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateProductDto) {
    return this.ProductService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.ProductService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ProductService.remove(id);
  }

  // ── IMAGE UPLOAD — saves to Cloudinary ────────────────────────────────────
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'estore/products' }, (error, result) => {
          if (error)
            reject(
              new BadRequestException(
                'Cloudinary upload failed: ' + error.message,
              ),
            );
          else resolve(result);
        })
        .end(file.buffer);
    });

    return { imageUrl: result.secure_url };
  }

  // ── LENS PNG UPLOAD — saves to Cloudinary ─────────────────────────────────
  // Lens PNGs are stored on Cloudinary (not local disk) because:
  // - They are served as image overlays in the browser via <img> or drawImage
  // - Cloudinary serves them with CORS headers needed for canvas drawImage
  // - Admin uploads once, all customers use the same CDN URL
  //
  // PNG requirements:
  // - 512x512 pixels, transparent background
  // - Circular lens texture centered in the image
  // - Transparent pupil center (inner 15-20%)
  // - Feathered outer edge into transparency
  @Post('upload-lens-png')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(png|webp)$/)) {
          return cb(
            new BadRequestException(
              'Only PNG or WebP files allowed for lens images',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    }),
  )
  async uploadLensPng(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No lens PNG file uploaded');

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'estore/lenses',
            // Preserve transparency for PNG
            format: 'png',
            // Resize to standard 512x512 if larger
            transformation: [{ width: 512, height: 512, crop: 'limit' }],
          },
          (error, result) => {
            if (error)
              reject(
                new BadRequestException(
                  'Cloudinary upload failed: ' + error.message,
                ),
              );
            else resolve(result);
          },
        )
        .end(file.buffer);
    });

    return { lensImageUrl: result.secure_url };
  }

  // ── GLB UPLOAD — saves to frontend /public/models/ folder ─────────────────
  @Post('upload-glb')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const isGlb =
          file.mimetype === 'model/gltf-binary' ||
          file.mimetype === 'application/octet-stream' ||
          file.originalname.endsWith('.glb') ||
          file.originalname.endsWith('.gltf');
        if (!isGlb) {
          return cb(
            new BadRequestException('Only GLB/GLTF files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadGlb(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No GLB file uploaded');

    if (!fs.existsSync(GLB_OUTPUT_DIR)) {
      fs.mkdirSync(GLB_OUTPUT_DIR, { recursive: true });
    }

    const safeName = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.\-_]/g, '')
      .toLowerCase();

    const filePath = path.join(GLB_OUTPUT_DIR, safeName);
    fs.writeFileSync(filePath, file.buffer);

    return { glbUrl: `/models/${safeName}` };
  }
}
