const midtransClient = require("midtrans-client");

module.exports = async (params) => {
  try {
    if (!params) throw new Error("params is required");

    const snap = new midtransClient.CoreApi({
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      isProduction: false,
    });

    let original_order_id = params.transaction_details.order_id;
    params.transaction_details.order_id = `ICP-${original_order_id}-${new Date().getTime()}`;

    if (params.payment_type === "gopay") {
      params.gopay = {
        enable_callback: true,
        callback_url: `icp-gahara://deeplink.icp-gahara.com/payment?order_id=${original_order_id}`,
      };
    } else if (params.payment_type === "shopeepay") {
      params.shopeepay = {
        callback_url: `icp-gahara://deeplink.icp-gahara.com/payment?order_id=${original_order_id}`,
      };
    } else if (
      params.payment_type === "bca_va" ||
      params.payment_type === "bni_va" ||
      params.payment_type === "bri_va"
    ) {
      params.bank_transfer = {
        bank: params.payment_type.split("_")[0],
      };
      params.payment_type = "bank_transfer";
    }

    const response = await snap.charge(params).catch((error) => {
      throw new Error(error);
    });

    console.log("response", response);

    if (response.payment_type === "bank_transfer") {
      return {
        bank: response.va_numbers[0].bank,
        va_number: response.va_numbers[0].va_number,
        action_url: null,
        expiry_time: response.expiry_time,
      };
    } else if (response.payment_type === "gopay") {
      let action = response.actions.find(
        (action) => action.name === "deeplink-redirect"
      );

      return {
        bank: null,
        va_number: null,
        action_url: action.url,
        expiry_time: response.expiry_time,
      };
    } else if (response.payment_type === "shopeepay") {
      return {
        bank: null,
        va_number: null,
        action_url: response.actions[0].url,
        expiry_time: response.expiry_time,
      };
    }
  } catch (error) {
    throw new Error(error);
  }
};
