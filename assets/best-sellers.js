// assets/best-sellers.js

const initBestSellersSection = (section) => {
    if (!section) return;

    const tabs = section.querySelectorAll('[data-best-sellers-tab]');
    const cards = section.querySelectorAll('[data-best-sellers-card]');
    const overlay = section.querySelector('[data-best-sellers-overlay]');
    const modal = section.querySelector('[data-best-sellers-modal]');
    const modalBody = modal?.querySelector('.best-sellers__modal-body') || null;
    const modalClose = modal?.querySelector('.best-sellers__modal-close') || null;
    const body = document.body;

    const setActive = (blockId) => {
        if (!blockId) return;

        tabs.forEach((tab) => {
            const isActive = tab.getAttribute('data-block-id') === blockId;
            tab.classList.toggle('is-active', isActive);
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        cards.forEach((card) => {
            const isActive = card.getAttribute('data-block-id') === blockId;
            card.classList.toggle('is-active', isActive);
        });
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const blockId = tab.getAttribute('data-block-id');
            if (tab.classList.contains('is-active')) {
                return;
            }
            setActive(blockId);
        });
    });

    const openModal = (productName) => {
        if (!overlay || !modal || !modalBody) return;

        modalBody.innerHTML = '';

        const text = document.createElement('p');
        text.textContent = `${productName} has been added to your wishlist.`;
        modalBody.appendChild(text);

        overlay.hidden = false;
        modal.hidden = false;

        body.classList.add('no-scroll');
    };

    const closeModal = () => {
        if (!overlay || !modal) return;
        overlay.hidden = true;
        modal.hidden = true;
        body.classList.remove('no-scroll');
    };

    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    section.addEventListener('click', (event) => {
        const wishlistButton = event.target.closest('.best-sellers__icon-button--wishlist');
        const quickAddButton = event.target.closest('.best-sellers__icon-button--quick-add');

        if (wishlistButton) {
            const activeCard = section.querySelector('.best-sellers__product-card.is-active');
            if (!activeCard) return;
            const productName = activeCard.getAttribute('data-product-title') || '';
            openModal(productName);
        }

        if (quickAddButton) {
            if (
                quickAddButton.hasAttribute('disabled') ||
                quickAddButton.getAttribute('aria-disabled') === 'true'
            ) {
                return;
            }

            const variantId = quickAddButton.getAttribute('data-variant-id');
            if (!variantId) return;

            fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ id: Number(variantId), quantity: 1 }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(() => fetch('/cart.js'))
                .then((response) => response.json())
                .then((cart) => {

                    const countBubble = document.querySelector(
                        '.cart-count-bubble__count, [data-cart-count]'
                    );

                    if (countBubble && typeof cart.item_count === 'number') {
                        countBubble.textContent = cart.item_count;
                    }

                    const cartUpdatedEvent = new CustomEvent('best-sellers:cart-updated', {
                        detail: { cart },
                    });
                    document.dispatchEvent(cartUpdatedEvent);
                })
                .catch((error) => {
                   
                    console.error('Best sellers quick add error', error);
                });
        }
    });
};

const initBestSellersSections = () => {
    const sections = document.querySelectorAll('[data-section-type="best-sellers"]');
    sections.forEach((section) => initBestSellersSection(section));
};

document.addEventListener('DOMContentLoaded', initBestSellersSections);