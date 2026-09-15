/** Rutas locales de fotos demo para productos y proveedores. */
export const productImages: Record<string, string> = {
  p1: '/products/p1.jpg',
  p2: '/products/p2.jpg',
  p3: '/products/p3.jpg',
  p4: '/products/p4.jpg',
  p5: '/products/p5.jpg',
  p6: '/products/p6.jpg',
  p7: '/products/p7.jpg',
  p8: '/products/p8.jpg',
  p9: '/products/p9.jpg',
  p10: '/products/p10.jpg',
  p11: '/products/p11.jpg',
  p12: '/products/p12.jpg',
  p13: '/products/p13.jpg',
  p14: '/products/p14.jpg',
  p15: '/products/p15.jpg',
  p16: '/products/p16.jpg',
  p17: '/products/p17.jpg',
  p18: '/products/p18.jpg',
  p19: '/products/p19.jpg',
  p20: '/products/p20.jpg',
  p21: '/products/p21.jpg',
  p22: '/products/p22.jpg',
}

export const supplierImages: Record<string, string> = {
  'Viveros del Levante': '/suppliers/viveros-levante.jpg',
  'Flora Mediterránea': '/suppliers/flora-mediterranea.jpg',
  'Distribuciones Hortícolas': '/suppliers/distribuciones-horticolas.jpg',
  'Cerámica Garden': '/suppliers/ceramica-garden.jpg',
  'AgroSupply Ibiza': '/suppliers/agrosupply-ibiza.jpg',
  'Viveros Can Marí': '/suppliers/viveros-can-mari.jpg',
}

export function getProductImage(productId: string): string {
  return productImages[productId] ?? '/placeholder.jpg'
}

export function getSupplierImage(supplierName: string): string {
  return supplierImages[supplierName] ?? '/placeholder-logo.png'
}

export const locationImages: Record<string, string> = {
  'Invernadero A': '/locations/invernadero-a.jpg',
  'Invernadero B': '/locations/invernadero-b.jpg',
  'Almacén principal': '/locations/almacen.jpg',
  'Cuarentena fitosanitaria': '/locations/cuarentena.jpg',
}

export function getLocationImage(locationName: string): string {
  return locationImages[locationName] ?? '/placeholder.jpg'
}
