export interface PaypalOauthTokenResponse {
    scope: string;
    access_token: string;
    token_type: string;
    app_id: string;
    expires_in: number;
    nonce: string;
}

export interface PaypalLinkDescription {
    href: string;
    re: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'CONNECT' | 'OPTIONS' | 'PATCH';
}

export enum PaypalCurrencyCode {
    AUD = 'AUD',
    BRL = 'BRL',
    CAD = 'CAD',
    CZK = 'CZK',
    DKK = 'DKK',
    EUR = 'EUR',
    HKD = 'HKD',
    HUF = 'HUF',
    INR = 'INR',
    ILS = 'ILS',
    JPY = 'JPY',
    MYR = 'MYR',
    MXN = 'MXN',
    TWD = 'TWD',
    NZD = 'NZD',
    NOK = 'NOK',
    PHP = 'PHP',
    PLN = 'PLN',
    GBP = 'GBP',
    RUB = 'RUB',
    SGD = 'SGD',
    SEK = 'SEK',
    CHF = 'CHF',
    THB = 'THB',
    USD = 'USD',
}

export enum PaypalCountryCode {
    AL = 'AL',
    DZ = 'DZ',
    AD = 'AD',
    AO = 'AO',
    AI = 'AI',
    AG = 'AG',
    AR = 'AR',
    AM = 'AM',
    AW = 'AW',
    AU = 'AU',
    AT = 'AT',
    AZ = 'AZ',
    BS = 'BS',
    BH = 'BH',
    BB = 'BB',
    BY = 'BY',
    BE = 'BE',
    BZ = 'BZ',
    BJ = 'BJ',
    BM = 'BM',
    BT = 'BT',
    BO = 'BO',
    BA = 'BA',
    BW = 'BW',
    BR = 'BR',
    VG = 'VG',
    BN = 'BN',
    BG = 'BG',
    BF = 'BF',
    BI = 'BI',
    KH = 'KH',
    CM = 'CM',
    CA = 'CA',
    CV = 'CV',
    KY = 'KY',
    TD = 'TD',
    CL = 'CL',
    C2 = 'C2',
    CO = 'CO',
    KM = 'KM',
    CG = 'CG',
    CD = 'CD',
    CK = 'CK',
    CR = 'CR',
    CI = 'CI',
    HR = 'HR',
    CY = 'CY',
    CZ = 'CZ',
    DK = 'DK',
    DJ = 'DJ',
    DM = 'DM',
    DO = 'DO',
    EC = 'EC',
    EG = 'EG',
    SV = 'SV',
    ER = 'ER',
    EE = 'EE',
    ET = 'ET',
    FK = 'FK',
    FO = 'FO',
    FJ = 'FJ',
    FI = 'FI',
    FR = 'FR',
    GF = 'GF',
    PF = 'PF',
    GA = 'GA',
    GM = 'GM',
    GE = 'GE',
    DE = 'DE',
    GI = 'GI',
    GR = 'GR',
    GL = 'GL',
    GD = 'GD',
    GP = 'GP',
    GT = 'GT',
    GN = 'GN',
    GW = 'GW',
    GY = 'GY',
    HN = 'HN',
    HK = 'HK',
    HU = 'HU',
    IS = 'IS',
    IN = 'IN',
    ID = 'ID',
    IE = 'IE',
    IL = 'IL',
    IT = 'IT',
    JM = 'JM',
    JP = 'JP',
    JO = 'JO',
    KZ = 'KZ',
    KE = 'KE',
    KI = 'KI',
    KW = 'KW',
    KG = 'KG',
    LA = 'LA',
    LV = 'LV',
    LS = 'LS',
    LI = 'LI',
    LT = 'LT',
    LU = 'LU',
    MK = 'MK',
    MG = 'MG',
    MW = 'MW',
    MY = 'MY',
    MV = 'MV',
    ML = 'ML',
    MT = 'MT',
    MH = 'MH',
    MQ = 'MQ',
    MR = 'MR',
    MU = 'MU',
    YT = 'YT',
    MX = 'MX',
    FM = 'FM',
    MD = 'MD',
    MC = 'MC',
    MN = 'MN',
    ME = 'ME',
    MS = 'MS',
    MA = 'MA',
    MZ = 'MZ',
    NA = 'NA',
    NR = 'NR',
    NP = 'NP',
    NL = 'NL',
    NC = 'NC',
    NZ = 'NZ',
    NI = 'NI',
    NE = 'NE',
    NG = 'NG',
    NU = 'NU',
    NF = 'NF',
    NO = 'NO',
    OM = 'OM',
    PW = 'PW',
    PA = 'PA',
    PG = 'PG',
    PY = 'PY',
    PE = 'PE',
    PH = 'PH',
    PN = 'PN',
    PL = 'PL',
    PT = 'PT',
    QA = 'QA',
    RE = 'RE',
    RO = 'RO',
    RU = 'RU',
    RW = 'RW',
    WS = 'WS',
    SM = 'SM',
    ST = 'ST',
    SA = 'SA',
    SN = 'SN',
    RS = 'RS',
    SC = 'SC',
    SL = 'SL',
    SG = 'SG',
    SK = 'SK',
    SI = 'SI',
    SB = 'SB',
    SO = 'SO',
    ZA = 'ZA',
    KR = 'KR',
    ES = 'ES',
    LK = 'LK',
    SH = 'SH',
    KN = 'KN',
    LC = 'LC',
    PM = 'PM',
    VC = 'VC',
    SR = 'SR',
    SJ = 'SJ',
    SZ = 'SZ',
    SE = 'SE',
    CH = 'CH',
    TW = 'TW',
    TJ = 'TJ',
    TZ = 'TZ',
    TH = 'TH',
    TG = 'TG',
    TO = 'TO',
    TT = 'TT',
    TN = 'TN',
    TM = 'TM',
    TC = 'TC',
    TV = 'TV',
    UG = 'UG',
    UA = 'UA',
    AE = 'AE',
    GB = 'GB',
    US = 'US',
    UY = 'UY',
    VU = 'VU',
    VA = 'VA',
    VE = 'VE',
    VN = 'VN',
    WF = 'WF',
    YE = 'YE',
    ZM = 'ZM',
    ZW = 'ZW',
}

export interface PaypalMoney {
    currency_code: PaypalCurrencyCode;

    value: string;
}

export interface PaypalName {
    prefix: string;
    given_name: string;
    surname: string;
    middle_name: string;
    suffix: string;
    full_name: string;
}

export interface PaypalAdressPortable {
    address_line_1: string;
    address_line_2: string;
    admin_area_2: string;
    admin_area_1: string;
    postal_code: string;
    country_code: PaypalCountryCode;
}

export interface PaypalSubscriber {
    name: Pick<PaypalName, 'given_name' | 'surname'>;
    email_address: string;
    payer_id: string;
    shipping_address: PaypalAdressPortable;
}

export interface PaypalCycleExecution {
    tenure_type: 'REGULAR' | 'TRIAL';
    sequence: number;
    cycles_completed: number;
    cycles_remaining: number;
    current_pricing_scheme_version: number;
    total_cycles: number;
}

export interface PaypalLastPaymentDetails {
    amount: PaypalMoney;
    time: string;
}

export interface PaypalFailedPaymentDetails {
    amount: PaypalMoney;
    time: string;
    reason_code: 'PAYMENT_DENIED' | 'COMPLIANCE_VIOLATION' | 'PAYEE_ACCOUNT_LOCKED_OR_CLOSED';
    next_payment_retry_time: string;
}

export interface PaypalBillingInfo {
    outstanding_balance: PaypalMoney;
    cycle_executions: PaypalCycleExecution[];
    last_payment: PaypalLastPaymentDetails;
    next_billing_time: string;
    final_payment_time: string;
    failed_payments_count: number;
    last_failed_payment: PaypalFailedPaymentDetails;
}

export enum PaypalSubscriptionStatus {
    APPROVAL_PENDING = 'APPROVAL_PENDING',
    APPROVED = 'APPROVED',
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
}

export interface PaypalSubscriptionDetails {
    status: PaypalSubscriptionStatus;
    status_change_note: string;
    status_update_time: string;
    id: string;
    plan_id: string;
    start_time: string;
    quantity: string;
    shipping_amount: PaypalMoney;
    subscriber: PaypalSubscriber;
    billing_info: PaypalBillingInfo;
    create_time: string;
    update_time: string;
    links: PaypalLinkDescription[];
}
