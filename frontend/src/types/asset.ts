export interface Asset {
  id: string;
  householdId: string;
  name: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetDto {
  name: string;
  category?: string;
  quantity?: number;
  unitPrice: number;
  currency?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateAssetDto extends Partial<CreateAssetDto> {}
