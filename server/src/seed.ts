import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDb } from './config/db.js';
import { Order } from './models/Order.js';
import { Product } from './models/Product.js';
import { User } from './models/User.js';
import { slugify } from './utils/slug.js';

const img = (id: string, w = 1000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

type SeedProduct = {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  category: string;
  cover: string;
  gallery: string[];
  sizes?: string[];
  colors?: string[];
  stock: number;
  featured?: boolean;
};

const PRODUCTS: SeedProduct[] = [
  {
    name: 'Osnovna pamučna majica',
    description:
      'Bezvremenska majica kratkih rukava od 100% organskog pamuka gramature 180 g/m². Mekana na dodir, s ojačanim ovratnikom koji zadržava oblik i nakon stotinu pranja. Nosi se sama ili ispod košulje.',
    price: 24.9,
    compareAtPrice: 32,
    category: 'Majice',
    cover: '1521572163474-6864f9cf17ab',
    gallery: ['1583743814966-8936f5b7be1a', '1618354691373-d851c5c3a990', '1622445275576-721325763afe'],
    colors: ['Bijela', 'Crna', 'Maslinasta'],
    stock: 48,
    featured: true,
  },
  {
    name: 'Oversized majica Lumen',
    description:
      'Opušteni kroj spuštenih ramena i teža pletenina koja lijepo pada. Diskretan vez na prsima i rebrasti ovratnik. Savršena za slojevito odijevanje tijekom prijelaznih sezona.',
    price: 32,
    category: 'Majice',
    cover: '1620799140408-edc6dcb6d633',
    gallery: ['1576566588028-4147f3842f27', '1503341504253-dff4815485f1'],
    colors: ['Pijesak', 'Grafit'],
    stock: 30,
  },
  {
    name: 'Lanena košulja Riva',
    description:
      'Košulja od europskog lana koja diše i s vremenom postaje sve mekša. Sedefasti gumbi, blago produžen stražnji dio i kroj koji se jednako dobro nosi zakopčan ili preko majice.',
    price: 69,
    compareAtPrice: 89,
    category: 'Košulje',
    cover: '1596755094514-f87e34085b2c',
    gallery: ['1602810318383-e386cc2a3ccf', '1489987707025-afc232f7ea0f'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Bijela', 'Nebo plava'],
    stock: 22,
    featured: true,
  },
  {
    name: 'Oxford košulja Classic',
    description:
      'Klasična oxford košulja od tkanine srednje gramature s button-down ovratnikom. Radni dan, vjenčanje ili vikend — kroj je dovoljno strukturiran za sve tri prilike.',
    price: 59,
    category: 'Košulje',
    cover: '1602810318383-e386cc2a3ccf',
    gallery: ['1594633312681-425c7b97ccd1', '1596755094514-f87e34085b2c'],
    colors: ['Bijela', 'Svijetlo plava'],
    stock: 18,
  },
  {
    name: 'Traperice Straight 90s',
    description:
      'Ravan kroj visokog struka od rigidnog denima od 13 oz. Pet klasičnih džepova, metalni zakovice i rub koji možete skratiti po mjeri. Boja koja lijepo blijedi s nošenjem.',
    price: 79,
    category: 'Hlače',
    cover: '1542272604-787c3835535d',
    gallery: ['1473966968600-fa801b869a1a', '1541099649105-f69ad21f3246'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Indigo', 'Isprano plava'],
    stock: 26,
    featured: true,
  },
  {
    name: 'Chino hlače Everyday',
    description:
      'Mekane chino hlače s malim udjelom elastana za slobodu kretanja. Suženi kroj prema dolje, bočni džepovi i pojas koji ne stišće tijekom cijelog dana.',
    price: 64.9,
    category: 'Hlače',
    cover: '1473966968600-fa801b869a1a',
    gallery: ['1542272604-787c3835535d'],
    colors: ['Bež', 'Tamno plava', 'Maslinasta'],
    stock: 34,
  },
  {
    name: 'Ljetna haljina Mira',
    description:
      'Lagana haljina midi duljine od viskoze s cvjetnim uzorkom. Naborani struk, podesive naramenice i suknja koja se prekrasno okreće. Idealna za vruće dane i večernje šetnje.',
    price: 89,
    compareAtPrice: 110,
    category: 'Haljine',
    cover: '1595777457583-95e059d581b8',
    gallery: ['1594938298603-c8148c4dae35', '1572804013309-59a88b7e92f1'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Cvjetni print', 'Crna'],
    stock: 15,
    featured: true,
  },
  {
    name: 'Pletena haljina Sera',
    description:
      'Rebrasta pletena haljina koja prati liniju tijela bez stezanja. Dugi rukavi i mekana mješavina viskoze i pamuka — nosiva od jeseni do proljeća.',
    price: 95,
    category: 'Haljine',
    cover: '1594938298603-c8148c4dae35',
    gallery: ['1572804013309-59a88b7e92f1'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Krem', 'Bordo'],
    stock: 12,
  },
  {
    name: 'Traper jakna Vintage',
    description:
      'Klasična traper jakna s dva džepa na prsima i blago izlizanim detaljima. Kroj dovoljno prostran da ispod stane džemper, a dovoljno uredan da ide preko haljine.',
    price: 119,
    category: 'Jakne',
    cover: '1544022613-e87ca75a784a',
    gallery: ['1551232864-3f0890e580d9', '1551028719-00167b16eac5'],
    colors: ['Srednje plava'],
    stock: 14,
    featured: true,
  },
  {
    name: 'Bomber jakna Nord',
    description:
      'Vodoodbojna bomber jakna s rebrastim ovratnikom i skrivenim džepom na rukavu. Lagana podstava koja grije bez volumena.',
    price: 139,
    compareAtPrice: 169,
    category: 'Jakne',
    cover: '1551028719-00167b16eac5',
    gallery: ['1544022613-e87ca75a784a', '1434389677669-e08b4cac3105'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Crna', 'Kaki'],
    stock: 9,
  },
  {
    name: 'Džemper od merino vune',
    description:
      'Fini pleteni džemper od 100% merino vune — grije, a ne bode. Okrugli izrez i rebrasti završeci koji zadržavaju oblik. Nosi se preko košulje ili na golo tijelo.',
    price: 109,
    category: 'Džemperi',
    cover: '1608234808654-2a8875faa7fd',
    gallery: ['1434389677669-e08b4cac3105'],
    colors: ['Sivi melanž', 'Tamno zelena'],
    stock: 20,
    featured: true,
  },
  {
    name: 'Kardigan Woolen',
    description:
      'Debeli kardigan s džepovima i gumbima od kokosove ljuske. Grublji pleteni uzorak i dužina do sredine bedra — omiljeni komad za hladna jutra.',
    price: 125,
    category: 'Džemperi',
    cover: '1434389677669-e08b4cac3105',
    gallery: ['1608234808654-2a8875faa7fd'],
    colors: ['Krem', 'Antracit'],
    stock: 11,
  },
  {
    name: 'Kožne tenisice Aria',
    description:
      'Minimalističke tenisice od pune kože s gumenim potplatom i uloškom od memorijske pjene. Bijela boja koja ide uz apsolutno sve iz ormara.',
    price: 149,
    category: 'Obuća',
    cover: '1549298916-b41d501d3772',
    gallery: ['1560343090-f0409e92791a', '1595950653106-6c9ebd614d3a'],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['Bijela', 'Crna'],
    stock: 25,
    featured: true,
  },
  {
    name: 'Kožna torba Mila',
    description:
      'Ručno rađena torba od talijanske kože s podesivim remenom i podstavljenim pretincem za laptop od 14". Patina koja se razvija s godinama korištenja.',
    price: 189,
    compareAtPrice: 220,
    category: 'Dodaci',
    cover: '1553062407-98eeb64c6a62',
    gallery: ['1548036328-c9fa89d128fa'],
    sizes: ['Univerzalna'],
    colors: ['Konjak', 'Crna'],
    stock: 7,
  },
];

async function seed() {
  await connectDb();

  console.log('[seed] brišem postojeće podatke…');
  await Promise.all([Product.deleteMany({}), Order.deleteMany({}), User.deleteMany({})]);

  const passwordHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('korisnik123', 10);

  await User.create([
    { name: 'Administrator', email: 'admin@trgovina.hr', passwordHash, role: 'admin' },
    {
      name: 'Ana Anić',
      email: 'ana@primjer.hr',
      passwordHash: userHash,
      role: 'user',
      phone: '+385 91 234 5678',
      address: { street: 'Ilica 15', city: 'Zagreb', postalCode: '10000', country: 'Hrvatska' },
    },
  ]);

  await Product.insertMany(
    PRODUCTS.map((p) => ({
      name: p.name,
      slug: slugify(p.name),
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      coverImage: img(p.cover),
      images: p.gallery.map((g) => img(g)),
      category: p.category,
      sizes: p.sizes ?? ['S', 'M', 'L', 'XL'],
      colors: p.colors ?? [],
      stock: p.stock,
      featured: p.featured ?? false,
      active: true,
    })),
  );

  console.log(`[seed] gotovo — ${PRODUCTS.length} proizvoda, 2 korisnika`);
  console.log('       admin:    admin@trgovina.hr / admin123');
  console.log('       korisnik: ana@primjer.hr / korisnik123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] greška:', err);
  process.exit(1);
});
