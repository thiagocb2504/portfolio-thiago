const header =
  document.querySelector('.header');

const menuButton =
  document.querySelector('.menu-toggle');

const navLinks =
  document.querySelector('.nav-links');


/* =========================
   HEADER AO ROLAR
========================= */

function updateHeader() {

  if (!header) {
    return;
  }

  header.classList.toggle(
    'scrolled',
    window.scrollY > 20
  );

}

window.addEventListener(
  'scroll',
  updateHeader
);

updateHeader();


/* =========================
   MENU MOBILE
========================= */

if (menuButton && navLinks) {

  menuButton.addEventListener(
    'click',
    () => {

      const isOpen =
        navLinks.classList.toggle('open');

      menuButton.setAttribute(
        'aria-expanded',
        String(isOpen)
      );

      menuButton.textContent =
        isOpen
          ? '✕'
          : '☰';

    }
  );


  /* FECHA AO CLICAR NO LINK */

  document
    .querySelectorAll('.nav-links a')
    .forEach(link => {

      link.addEventListener(
        'click',
        () => {

          navLinks.classList.remove(
            'open'
          );

          menuButton.setAttribute(
            'aria-expanded',
            'false'
          );

          menuButton.textContent =
            '☰';

        }
      );

    });


  /* FECHA COM ESC */

  document.addEventListener(
    'keydown',
    event => {

      if (
        event.key === 'Escape'
      ) {

        navLinks.classList.remove(
          'open'
        );

        menuButton.setAttribute(
          'aria-expanded',
          'false'
        );

        menuButton.textContent =
          '☰';

      }

    }
  );


  /* FECHA AO VOLTAR PARA DESKTOP */

  window.addEventListener(
    'resize',
    () => {

      if (
        window.innerWidth > 900
      ) {

        navLinks.classList.remove(
          'open'
        );

        menuButton.setAttribute(
          'aria-expanded',
          'false'
        );

        menuButton.textContent =
          '☰';

      }

    }
  );

}


/* =========================
   LINKS INTERNOS
========================= */

document
  .querySelectorAll('a[href^="#"]')
  .forEach(link => {

    link.addEventListener(
      'click',
      event => {

        const targetId =
          link.getAttribute('href');


        if (
          !targetId ||
          targetId === '#'
        ) {
          return;
        }


        const target =
          document.querySelector(
            targetId
          );


        if (!target) {
          return;
        }


        event.preventDefault();


        /* VOLTAR AO TOPO */

        if (
          targetId === '#topo'
        ) {

          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });

          return;
        }


        /* OUTRAS SEÇÕES */

        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

      }
    );

  });


/* =========================
   ANIMAÇÃO AO APARECER
========================= */

const revealElements =
  document.querySelectorAll(
    '.reveal'
  );


if (
  !(
    'IntersectionObserver'
    in window
  )
) {

  revealElements.forEach(
    element => {

      element.classList.add(
        'visible'
      );

    }
  );

} else {

  const observer =
    new IntersectionObserver(

      entries => {

        entries.forEach(
          entry => {

            if (
              entry.isIntersecting
            ) {

              entry.target
                .classList
                .add(
                  'visible'
                );

              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },

      {
        threshold: 0.12,

        rootMargin:
          '0px 0px -40px 0px'
      }

    );


  revealElements.forEach(
    element => {

      observer.observe(
        element
      );

    }
  );

}