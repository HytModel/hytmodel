module.exports = function calculateCommission({
                                                  priceCents,
                                                  isAffiliated
                                              }) {
    const COMMISSION_AFFILIE = 0.10;
    const COMMISSION_STANDARD = 0.15;

    const rate = isAffiliated
        ? COMMISSION_AFFILIE
        : COMMISSION_STANDARD;

    const commission = Math.round(priceCents * rate);
    const sellerAmount = priceCents - commission;

    return {
        commission,
        sellerAmount,
        rate
    };
};
