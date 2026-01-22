<script>
  let {
    size = 24,
    class: className = '',
    ...rest
  } = $props();
</script>

<svg
  id="a"
  data-name="Layer 1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 763.67 763.67"
  width={size}
  height={size}
  class={className}
  aria-hidden="true"
  {...rest}
>
  <defs>
      <style>
        .c {
          fill: url(#b);
        }
      </style>
      <linearGradient id="b" x1="381.84" y1="2.33" x2="381.84" y2="766" gradientTransform="translate(0 766) scale(1 -1)" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#c13d68"/>
        <stop offset="1" stop-color="#d64d7a"/>
      </linearGradient>
    </defs>
    <path class="c" d="M508.79,381.84l254.88,253.91-127.93,127.93-253.91-254.88-253.91,254.88L0,635.74l254.88-253.91L0,127.93,127.93,0l253.91,254.88L635.74,0l127.93,127.93-254.88,253.91" vector-effect="none"/>
</svg>
