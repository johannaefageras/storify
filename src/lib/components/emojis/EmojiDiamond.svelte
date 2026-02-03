<script>
  let {
    size = 24,
    class: className = '',
    ...rest
  } = $props();
</script>

<svg
  data-name="Layer 1"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 914.88 914.88"
  width={size}
  height={size}
  class={className}
  aria-hidden="true"
  {...rest}
>
  <defs>
      <linearGradient id="emoji-diamond-gradient" x1="0" y1="914.88" x2="1" y2="914.88" gradientTransform="translate(-766650.76 1273.86) rotate(-90.03) scale(838.48)" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#dc2f68"/>
        <stop offset=".5" stop-color="#dc2f68"/>
        <stop offset="1" stop-color="#f43f7a"/>
      </linearGradient>
    </defs>
    <polyline fill="#dc2f68" points="457.44 0 914.88 457.44 457.44 914.88 0 457.44 457.44 0"/>
    <polyline fill="url(#emoji-diamond-gradient)" points="457.42 38.16 876.66 457.4 457.42 876.64 38.18 457.4 457.42 38.16"/>
</svg>
