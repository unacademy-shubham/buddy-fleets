import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

/* =========================================================
   BUDDY FLEETS
   ASSET OPTIMIZER

   1. Home page images download karega
   2. Optimized WebP variants create karega
   3. favicon.svg ko 512x512 favicon.png me convert karega
========================================================= */

const PROJECT_ROOT =
  process.cwd();

const PUBLIC_DIR =
  path.resolve(
    PROJECT_ROOT,
    'public'
  );

const IMAGE_OUTPUT_DIR =
  path.resolve(
    PUBLIC_DIR,
    'images'
  );

const FAVICON_SVG =
  path.resolve(
    PUBLIC_DIR,
    'favicon.svg'
  );

const FAVICON_PNG =
  path.resolve(
    PUBLIC_DIR,
    'favicon.png'
  );

/* =========================================================
   SOURCE PHOTOS
========================================================= */

const SOURCES = {
  truck:
    'https://images.unsplash.com/photo-1519003722824-194d4455a60c',

  workshop:
    'https://images.unsplash.com/photo-1487754180451-c456f719a1fc',

  finance:
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c',
};

/* =========================================================
   HOME IMAGE VARIANTS
========================================================= */

const IMAGES = [
  {
    name:
      'truck-400.webp',

    source:
      SOURCES.truck,

    width:
      400,

    quality:
      55,
  },

  {
    name:
      'truck-640.webp',

    source:
      SOURCES.truck,

    width:
      640,

    quality:
      58,
  },

  {
    name:
      'workshop-400.webp',

    source:
      SOURCES.workshop,

    width:
      400,

    quality:
      55,
  },

  {
    name:
      'workshop-560.webp',

    source:
      SOURCES.workshop,

    width:
      560,

    quality:
      58,
  },

  {
    name:
      'finance-400.webp',

    source:
      SOURCES.finance,

    width:
      400,

    quality:
      55,
  },

  {
    name:
      'finance-560.webp',

    source:
      SOURCES.finance,

    width:
      560,

    quality:
      58,
  },
];

/* =========================================================
   FORMAT BYTES
========================================================= */

function formatBytes(
  bytes
) {
  if (
    bytes < 1024
  ) {
    return `${bytes} B`;
  }

  return `${(
    bytes / 1024
  ).toFixed(
    1
  )} KB`;
}

/* =========================================================
   DOWNLOAD OPTIMIZED WEBP
========================================================= */

async function downloadImage(
  image
) {
  const url =
    new URL(
      image.source
    );

  url.searchParams.set(
    'auto',
    'format'
  );

  url.searchParams.set(
    'fm',
    'webp'
  );

  url.searchParams.set(
    'fit',
    'crop'
  );

  url.searchParams.set(
    'w',
    String(
      image.width
    )
  );

  url.searchParams.set(
    'q',
    String(
      image.quality
    )
  );

  const response =
    await fetch(
      url,
      {
        headers: {
          Accept:
            'image/webp,image/*',
        },
      }
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `Failed: ${image.name} — HTTP ${response.status}`
    );
  }

  const contentType =
    response.headers.get(
      'content-type'
    );

  if (
    !contentType
      ?.includes(
        'image'
      )
  ) {
    throw new Error(
      `Invalid image response for ${image.name}`
    );
  }

  const arrayBuffer =
    await response
      .arrayBuffer();

  const buffer =
    Buffer.from(
      arrayBuffer
    );

  const outputPath =
    path.join(
      IMAGE_OUTPUT_DIR,
      image.name
    );

  await fs.writeFile(
    outputPath,
    buffer
  );

  console.log(
    `✓ ${image.name.padEnd(
      24
    )} ${formatBytes(
      buffer.length
    )}`
  );
}

/* =========================================================
   CREATE PNG FAVICON

   Source:
   public/favicon.svg

   Output:
   public/favicon.png

   Google Search-friendly:
   512 × 512 PNG
========================================================= */

async function createFaviconPng() {
  try {
    await fs.access(
      FAVICON_SVG
    );
  } catch {
    throw new Error(
      `favicon.svg not found:\n${FAVICON_SVG}`
    );
  }

  await sharp(
    FAVICON_SVG,
    {
      density:
        384,
    }
  )
    .resize(
      512,
      512,
      {
        fit:
          'contain',
      }
    )
    .png({
      compressionLevel:
        9,

      adaptiveFiltering:
        true,
    })
    .toFile(
      FAVICON_PNG
    );

  const fileInfo =
    await fs.stat(
      FAVICON_PNG
    );

  console.log(
    `✓ ${'favicon.png'.padEnd(
      24
    )} ${formatBytes(
      fileInfo.size
    )}  [512×512]`
  );
}

/* =========================================================
   MAIN
========================================================= */

async function main() {
  console.log(
    '\n=============================================='
  );

  console.log(
    ' Buddy Fleets — Asset Optimizer'
  );

  console.log(
    '==============================================\n'
  );

  /* =======================================================
     CREATE REQUIRED DIRECTORIES
  ======================================================= */

  await fs.mkdir(
    IMAGE_OUTPUT_DIR,
    {
      recursive:
        true,
    }
  );

  /* =======================================================
     HOME IMAGES
  ======================================================= */

  console.log(
    'Optimizing Home images...\n'
  );

  for (
    const image of IMAGES
  ) {
    await downloadImage(
      image
    );
  }

  /* =======================================================
     FAVICON
  ======================================================= */

  console.log(
    '\nCreating PNG favicon...\n'
  );

  await createFaviconPng();

  /* =======================================================
     COMPLETE
  ======================================================= */

  console.log(
    '\n=============================================='
  );

  console.log(
    ' ✓ Asset optimization completed'
  );

  console.log(
    '==============================================\n'
  );

  console.log(
    'Generated Home images:'
  );

  console.log(
    IMAGE_OUTPUT_DIR
  );

  console.log(
    '\nGenerated favicon:'
  );

  console.log(
    FAVICON_PNG
  );

  console.log('');
}

/* =========================================================
   RUN
========================================================= */

main().catch(
  (
    error
  ) => {
    console.error(
      '\n❌ Asset optimization failed:\n'
    );

    console.error(
      error
    );

    process.exitCode =
      1;
  }
);