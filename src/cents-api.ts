import {
    type OrderType,
    type OrderPrefix,
    type CustomerType,
    type PaymentType,
    type OrderStatus,
    type ReportHeader,
    type InventoryReportResponse,
    type OrderReportItem,
    type OrderReportResponse,
    type OrderCategory,
    type OrderSubcategory,
    type RawOrderReportData,
    type RawOrderReportResponse,
    type RawInventoryResponse,
    type InventoryCategory,
    type Inventory,
    type InventoryItem,
    type ProductAndQuantity,
    type LocationsResponse,

    INVENTORY_CATEGORIES,
    ORDER_SUBCATEGORIES,
    ORDER_CATEGORIES,
    ORDER_TYPES,
    ORDER_PREFIXES,
    PAYMENT_TYPES,
} from './types.js';
// import { FAKE_INVENTORY_REPORT, FAKE_RAW_ORDER_REPORT_RESPONSE } from './test-data.js';

const BASE_API = 'https://api3.trycents.com/api/v1';
const LOCATIONS_API = `${BASE_API}/business-owner/locations`;
const ORDERS_API = `${BASE_API}/business-owner/reports/real-time/orders-builder`;
const INVENTORY_API = `${BASE_API}/business-owner/reports/real-time/inventory-builder`;

const PRODUCT_AND_QUANTITY_REGEX = /^\s*(\d+)\s*x\s*(.+)$/;

export interface CentsAPIContext {
    token: string;
    stores: number[];
    timeZone: string;
}

function parseInventoryCategory(value: string): InventoryCategory {
    if (!INVENTORY_CATEGORIES.has(value)) {
        throw new Error(`Invalid inventory category: ${value}`);
    }

    return value as InventoryCategory;
}

function parseOrderType(value: string): OrderType {
    if (!ORDER_TYPES.has(value)) {
        throw new Error(`Invalid order type: ${value}`);
    }

    return value as OrderType;
}

function parseOrderPrefix(value: string): OrderPrefix {
    if (!ORDER_PREFIXES.has(value)) {
        throw new Error(`Invalid order prefix: ${value}`);
    }

    return value as OrderPrefix;
}

function parseMoneyString(value: string | null): number {
    if (value === null) {
        return 0;
    }

    // Remove the dollar sign and commas, then parse as a float
    const numericValue = parseFloat(value.replace(/[$,]/g, ''));

    if (isNaN(numericValue)) {
        throw new Error(`Invalid money string: ${value}`);
    }

    return numericValue;
}

function parseOptMoneyString(value: string | null): number | null {
    if (value === null) {
        return null;
    }

    return parseMoneyString(value);
}

function parseDate(value: string): Date {
    return new Date(value);
}

function parseOptDate(value: string | null): Date | null {
    if (value === null) {
        return null;
    }

    return parseDate(value);
}

function parseCategory(value: string): OrderCategory {
    if (!ORDER_CATEGORIES.has(value)) {
        throw new Error(`Invalid category: ${value}`);
    }

    return value as OrderCategory;
}

function parseCategories(value: string): OrderCategory[] {
    return value.split(',').map(category => parseCategory(category.trim()));
}

function parseSubcategory(value: string): OrderSubcategory {
    if (!ORDER_SUBCATEGORIES.has(value)) {
        throw new Error(`Invalid subcategory: ${value}`);
    }

    return value as OrderSubcategory;
}

function parseSubcategories(value: string): OrderSubcategory[] {
    return value.split(',').map(subcategory => parseSubcategory(subcategory.trim()));
}

function parsePaymentType(value: string): PaymentType {
    if (!PAYMENT_TYPES.has(value)) {
        throw new Error(`Invalid payment type: ${value}`);
    }

    return value as PaymentType;
}

function parsePaymentTypes(value: string | null): PaymentType[] {
    if (value === null) {
        return [];
    }

    return value.split(',').map(paymentType => parsePaymentType(paymentType.trim()));
}

function parseProducts(value: string | null): ProductAndQuantity[] {
    if (value === null) {
        return [];
    }

    const products: ProductAndQuantity[] = [];

    for (const pq of value.split(',')) {
        const match = pq.match(PRODUCT_AND_QUANTITY_REGEX);
        if (!match) {
            throw new Error(`Invalid product format: ${pq}`);
        }

        const [, quantityStr, productName] = match;
        const quantity = parseInt(quantityStr, 10);

        if (isNaN(quantity)) {
            throw new Error(`Invalid product quantity: ${quantityStr}`);
        }

        products.push({ productName, quantity });
    }

    return products;
}

//
// ** Locations API **
//

export async function getLocations(token: string): Promise<LocationsResponse> {
    const response = await fetch(LOCATIONS_API, {
        headers: {
            'Authtoken': token
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.statusText}`);
    }

    const data: LocationsResponse = await response.json();

    if (!data.success) {
        throw new Error('Failed to fetch locations: API returned unsuccessful response');
    }

    return data;
}

//
// ** Inventory API **
//

function convertToInventoryResponse(data: RawInventoryResponse): InventoryReportResponse {
    return {
        success: data.success,
        finalReportData: data.finalReportData.map(item => ({
            id: item.id,
            productName: item.productName,
            locationName: item.locationName,
            price: parseMoneyString(item.price),
            sku: item.sku,
            category: parseInventoryCategory(item.category),
            isTaxable: item.isTaxable,
            isUnsellable: item.isUnsellable,
            quantity: item.quantity
        })),
        reportName: data.reportName,
        reportHeaders: data.reportHeaders
    };
}

export async function getInventoryReport(context: CentsAPIContext): Promise<InventoryReportResponse> {
    const { stores, token } = context;
    const body: Record<string, unknown> = {
        stores,
        stockLevel: [
            'inStock',
            'outOfStock'
        ],
        includeUnsellable: true
    };
    const response = await fetch(INVENTORY_API, {
        headers: {
            'Authtoken': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        method: 'POST'
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch inventory report: ${response.statusText}`);
    }

    const data: RawInventoryResponse = await response.json();

    if (!data.success) {
        throw new Error('Failed to fetch inventory report: API returned unsuccessful response');
    }

    return convertToInventoryResponse(data);
}

export async function getInventory(context: CentsAPIContext): Promise<Inventory> {
    const inventoryReport = await getInventoryReport(context);

    return inventoryReport.finalReportData.reduce((all, one) => all.set(one.productName, one), new Map<string, InventoryItem>());
}

//
// ** Order API **
//

function convertToOrderReportData(data: RawOrderReportData): OrderReportItem {
    return {
        orderType: parseOrderType(data.orderType),
        orderPrefix: parseOrderPrefix(data.orderPrefix),
        pickupFee: parseMoneyString(data.pickupFee),
        deliveryFee: parseMoneyString(data.deliveryFee),
        categories: parseCategories(data.categories),
        subcategories: parseSubcategories(data.subcategories),
        customerType: data.customerType,
        id: data.id,
        intakeDate: parseDate(data.intakeDate),
        orderId: data.orderId,
        orderLocation: data.orderLocation,
        locationAddress: data.locationAddress,
        orderIntakeDate: data.orderIntakeDate,
        orderIntakeTime: data.orderIntakeTime,
        intakeEmployee: data.intakeEmployee,
        customerName: data.customerName,
        customerPhoneNumber: data.customerPhoneNumber,
        customerAttributes: data.customerAttributes,
        perPoundValue: parseMoneyString(data.perPoundValue),
        fixedPriceValue: parseMoneyString(data.fixedPriceValue),
        productsValue:  parseMoneyString(data.productsValue),
        intakePounds: data.intakePounds,
        perPoundServices: data.perPoundServices,
        fixedPriceServices: data.fixedPriceServices,
        products: parseProducts(data.products),
        onDemandPickupTip: parseMoneyString(data.onDemandPickupTip),
        onDemandDeliveryTip: parseMoneyString(data.onDemandDeliveryTip),
        subTotalOrderValue: parseMoneyString(data.subTotalOrderValue),
        promoCodes: data.promoCodes,
        promoDiscount: parseMoneyString(data.promoDiscount),
        recurringDiscount: parseMoneyString(data.recurringDiscount),
        creditApplied: parseMoneyString(data.creditApplied),
        rewardsApplied: parseMoneyString(data.rewardsApplied),
        tipAmount: parseMoneyString(data.tipAmount),
        roundUpAmount: parseMoneyString(data.roundUpAmount),
        balanceDue: parseMoneyString(data.balanceDue),
        convenienceFee: parseMoneyString(data.convenienceFee),
        transactionFee: parseOptMoneyString(data.transactionFee),
        taxAmount: parseMoneyString(data.taxAmount),
        orderValueTotal: parseMoneyString(data.orderValueTotal),
        paymentDate: parseOptDate(data.paymentDate),
        orderPaymentDate: data.orderPaymentDate,
        orderPaymentTime: data.orderPaymentTime,
        paymentEmployee: data.paymentEmployee,
        paymentType: parsePaymentTypes(data.paymentType),
        paymentMemo: data.paymentMemo,
        paymentStatus: data.paymentStatus,
        orderStatus: data.orderStatus,
        modifiers: data.modifiers,
        deliverySubsidy: data.deliverySubsidy,
        pickupSubsidy: data.pickupSubsidy,
        orderStorage: data.orderStorage,
        rewardsEarned: data.rewardsEarned,
        dueDate: parseOptDate(data.dueDate),
        completeProcessingDate: data.completeProcessingDate,
        completeProcessingEmployee: data.completeProcessingEmployee,
        pickupDriver: data.pickupDriver,
        deliveryDriver: data.deliveryDriver
    };
}

function convertToOrderReportResponse(data: RawOrderReportResponse): OrderReportResponse {
    return {
        success: data.success,
        finalReportData: data.finalReportData.map(convertToOrderReportData),
        reportName: data.reportName,
        reportHeaders: data.reportHeaders
    };
}

export async function getOrdersReport(inventory: Inventory, context: CentsAPIContext, start: Date, end: Date): Promise<OrderReportResponse> {
    const { stores, timeZone, token } = context;
    const body: Record<string, unknown> = {
        stores,
        timeZone,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        orderType: [
            'walk_in_service',
            'online_service',
            'product_only_sale'
        ],
        orderStatus: [
            'active',
            'completed',
            'voided'
        ],
        reportingDate: 'intake',
        paymentType: [
            'creditCard',
            'cash',
            'cashCard',
            'other',
            'ach',
            'world_net',
            'check'
        ],
        paymentStatus: [
            'paid',
            'unpaid',
            'pending',
            'invoicing',
            'invoiced',
            'invoice_paid'
        ],
        includeCancellationReason: false,
        showTotalsOnFirstRow: false
    };
    const response = await fetch(ORDERS_API, {
        headers: {
            'Authtoken': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        method: 'POST'
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch orders report: ${response.statusText}`);
    }

    const data: RawOrderReportResponse = await response.json();

    if (!data.success) {
        throw new Error('Failed to fetch orders report: API returned unsuccessful response');
    }

    const orders = convertToOrderReportResponse(data);
    const ordersWithInvalidProducts = orders.finalReportData.filter(order => {
        return order.products.some(product => !inventory.has(product.productName));
    });

    if (ordersWithInvalidProducts.length > 0) {
        const invalidProducts = ordersWithInvalidProducts.flatMap(order => order.products.filter(product => !inventory.has(product.productName)));

        throw new Error(`Found orders with invalid products: ${invalidProducts.join(', ')}`);
    }

    return orders;
}
