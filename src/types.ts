export interface LocationsResponse {
    success: boolean;
    totalRecords: string;
    allLocations: Location[];
    needsRegions: boolean;
}

export interface Location {
    id: number;
    name: string;
    city: string;
    address: string;
    type: string;
    state: string;
    zipCode: string;
    totalRecords: string;
    shifts: Shift[];
    settings: Settings;
}

export interface Shift {
    name: string;
}

export interface Settings {
    lat: number;
    lng: number;
    timeZone: string;
}

export type DataType = 'string' | 'number' | 'boolean' | 'money-string' | 'date' | 'time';
export interface ReportHeader {
    title: string;
    id: string;
    dataType: DataType;
    includedInTotalCalc?: boolean;
}

export type InventoryCategory = 'Cash for Credit' | 'Tanning Packages' | 'Lotions' | 'Tanning Accessories' | 'Laundry Accessories' | 'Laundry Receipts Only' | 'Vending Items' | 'Gift Cards';
export const INVENTORY_CATEGORIES: Set<string> = new Set<string>([
    'Cash for Credit',
    'Tanning Packages',
    'Lotions',
    'Tanning Accessories',
    'Laundry Accessories',
    'Laundry Receipts Only',
    'Vending Items',
    'Gift Cards'
]);

export interface InventoryItem {
    id: number;
    productName: string;
    locationName: string;
    price: number;
    sku: string | null;
    category: InventoryCategory;
    isTaxable: boolean;
    isUnsellable: boolean;
    quantity: number;
}
export type InventoryReportResponse = BaseReportResponse<InventoryItem>;
export type Inventory = Map<string, InventoryItem>; // key is productName

export type OrderType = 'service' | 'inventory' | 'online';
export type OrderPrefix = 'S' | 'P' | 'G' | 'O' | 'DS';
export type OrderCategory = 'Laundry' | 'Products';
export type OrderSubcategory = 'Per Pound' | 'Laundry Accessories' | 'Fixed Price' | 'Vending Items' | 'Tanning Packages' | 'Cash for Credit' | 'Gift Cards' | 'Tanning Accessories' | 'Lotions';
export type CustomerType = 'Retail' | 'Commercial';
export type PaymentType = 'Debit/Credit' | 'Cash';
export type OrderStatus = 'completed' | 'ready for pickup' | 'cancelled';

export const ORDER_TYPES: Set<string> = new Set<string>(['service', 'inventory', 'online']);
export const ORDER_PREFIXES: Set<string> = new Set<string>(['S', 'P', 'G', 'O', 'DS']);
export const ORDER_CATEGORIES: Set<string> = new Set<string>(['Laundry', 'Products']);
export const ORDER_SUBCATEGORIES: Set<string> = new Set<string>([
    'Per Pound',
    'Laundry Accessories',
    'Fixed Price',
    'Vending Items',
    'Tanning Packages',
    'Cash for Credit',
    'Gift Cards',
    'Tanning Accessories',
    'Lotions'
]);
export const CUSTOMER_TYPES: Set<string> = new Set<string>(['Retail', 'Commercial']);
export const PAYMENT_TYPES: Set<string> = new Set<string>(['Debit/Credit', 'Cash']);
export const ORDER_STATUSES: Set<string> = new Set<string>(['completed', 'ready for pickup', 'cancelled']);

export interface ProductAndQuantity {
    productName: string;
    quantity: number;
}

export interface OrderReportItem {
    orderType: OrderType;
    orderPrefix: OrderPrefix;
    pickupFee: number;
    deliveryFee: number;

    categories: OrderCategory[];
    subcategories: OrderSubcategory[];
    customerType: CustomerType;
    id: number;
    intakeDate: Date;
    orderId: string;
    orderLocation: string;
    locationAddress: string;

    orderIntakeDate: string; // MM-DD-YYYY date string
    orderIntakeTime: string; // HH:MM AM/PM time string

    intakeEmployee: string;

    customerName: string;
    customerPhoneNumber: string;
    customerAttributes: string | null;

    perPoundValue: number;
    fixedPriceValue: number;
    productsValue: number;

    intakePounds: number | null;

    perPoundServices: string | null;
    fixedPriceServices: string | null;
    products: ProductAndQuantity[];

    onDemandPickupTip: number;
    onDemandDeliveryTip: number;
    subTotalOrderValue: number;

    promoCodes: string | null;
    promoDiscount: number;

    recurringDiscount: number;

    creditApplied: number;
    rewardsApplied: number;
    tipAmount: number;
    roundUpAmount: number;
    balanceDue: number;
    convenienceFee: number;
    transactionFee: number | null;
    taxAmount: number;
    orderValueTotal: number;

    paymentDate: Date | null; // ISO date string
    orderPaymentDate: string | null; // MM-DD-YYYY date string
    orderPaymentTime: string | null; // HH:MM AM/PM time string
    paymentEmployee: string;
    paymentType: PaymentType[];
    paymentMemo: string | null;
    paymentStatus: string;

    orderStatus: OrderStatus;
    modifiers: string | null;
    deliverySubsidy: string | null;
    pickupSubsidy: string | null;
    orderStorage: string | null;
    rewardsEarned: number;
    dueDate: Date | null; // MM-DD-YYYY HH:MM AM/PM date string
    completeProcessingDate: string | null; // MM-DD-YYYY date string
    completeProcessingEmployee: string | null;
    pickupDriver: string | null;
    deliveryDriver: string | null
}
export type OrderReportResponse = BaseReportResponse<OrderReportItem>;

//
// ** Raw API response types
//

export interface BaseReportResponse<T> {
    success: boolean;
    finalReportData: T[];
    reportName: string;
    reportHeaders: ReportHeader[];
}

export interface RawOrderReportData {
    orderType: OrderType;
    orderPrefix: OrderPrefix;
    pickupFee: string;  // money string
    deliveryFee: string; // money string

    categories: string;  // comma-separated list of OrderCategory values
    subcategories: string;  // comma-separated list of OrderSubcategory values
    customerType: CustomerType;
    id: number;
    intakeDate: string; // ISO date string
    orderId: string;
    orderLocation: string;
    locationAddress: string;

    orderIntakeDate: string; // MM-DD-YYYY date string
    orderIntakeTime: string; // HH:MM AM/PM time string

    intakeEmployee: string;

    customerName: string;
    customerPhoneNumber: string;
    customerAttributes: string | null;

    perPoundValue: string;  // money string
    fixedPriceValue: string; // money string
    productsValue: string; // money string

    intakePounds: number | null;

    perPoundServices: string | null;
    fixedPriceServices: string | null;
    products: string | null;

    onDemandPickupTip: string; // money string
    onDemandDeliveryTip: string; // money string
    subTotalOrderValue: string; // money string

    promoCodes: string | null;
    promoDiscount: string; // money string

    recurringDiscount: string; // money string

    creditApplied: string; // money string
    rewardsApplied: string; // money string
    tipAmount: string; // money string
    roundUpAmount: string; // money string
    balanceDue: string; // money string
    convenienceFee: string; // money string
    transactionFee: string | null; // money string
    taxAmount: string; // money string
    orderValueTotal: string; // money string

    paymentDate: string | null; // ISO date string
    orderPaymentDate: string | null; // MM-DD-YYYY date string
    orderPaymentTime: string | null; // HH:MM AM/PM time string
    paymentEmployee: string;
    paymentType: string | null;
    paymentMemo: string | null;
    paymentStatus: string;

    orderStatus: OrderStatus;
    modifiers: string | null;
    deliverySubsidy: string | null;
    pickupSubsidy: string | null;
    orderStorage: string | null;
    rewardsEarned: number;
    dueDate: string | null; // MM-DD-YYYY HH:MM AM/PM date string
    completeProcessingDate: string | null; // MM-DD-YYYY date string
    completeProcessingEmployee: string | null;
    pickupDriver: string | null;
    deliveryDriver: string | null
}
export type RawOrderReportResponse = BaseReportResponse<RawOrderReportData>;

export interface RawInventoryItem {
    id: number;
    productName: string;
    locationName: string;
    price: string;
    sku: string | null;
    category: string;
    isTaxable: boolean;
    isUnsellable: boolean;
    quantity: number;
}
export type RawInventoryResponse = BaseReportResponse<RawInventoryItem>;
