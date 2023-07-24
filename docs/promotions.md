# Promotions

***BY AI***

In the context of Point of Sale (POS) systems, "offers," "discounts," and "gift cards" are different types of promotions or incentives that businesses can use to attract customers and increase sales. Let's explore the differences between them:

- Offers:
    "Offers" is a broad term that encompasses any promotion or special deal provided by a business to its customers. These offers can come in various forms, such as percentage-based discounts, buy-one-get-one-free (BOGO) deals, free items with purchase, or special pricing on specific products or services. The key aspect of an offer is that it provides customers with a tangible advantage, encouraging them to make a purchase.

- Discounts:
    Discounts are a specific type of offer where the price of a product or service is reduced from its original or regular price. This reduction can be expressed as a percentage off the regular price (e.g., 10% off) or a fixed amount deduction (e.g., $5 off). Discounts are temporary and are often used to promote products, clear out inventory, or incentivize customers to buy in larger quantities. In a POS system, discounts are usually applied directly to the total purchase amount during the checkout process.

- Gift Cards:
    Gift cards are a form of prepaid payment cards that customers can purchase from a business and use later to make purchases up to the card's value. These cards can be physical or electronic (e-gift cards). Customers can either use the gift card themselves to make purchases or gift them to someone else. Gift cards are different from discounts and offers because they represent a set value that customers can spend within the business, rather than an immediate price reduction.

Here's a simple breakdown:

- Offers: Broad term for any promotional deal or incentive.
- Discounts: Specific reductions in the price of products or services.
- Gift Cards: Prepaid cards with a set value that customers can use for future purchases.

In a POS system, businesses can easily apply discounts and process gift cards as part of their sales transactions to attract and retain customers while encouraging repeat business.

## Our implementation

for simplicity and to target only use cases we care about, we will implement single type of
offers, which is buy this amount of this product togther to get them with this price

example

prdocut `A` price is `10`

admin can add offer like that `12 of A = 100 instead of 120`

user could buy any number of `A` or buy the offer

> note: for now(24/7/2023) this feature will be used to support wholesale, our users need to be informed with this in a way or another
