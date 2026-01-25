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
  viewBox="0 0 914.88 914.88"
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
  
        .d {
          fill: #e95685;
        }
      </style>
      <linearGradient id="b" x1="457.64" y1="39.36" x2="457.2" y2="877.84" gradientTransform="translate(0 916) scale(1 -1)" gradientUnits="userSpaceOnUse">
        <stop offset=".5" stop-color="#e95685"/>
        <stop offset="1" stop-color="#ff73a3"/>
      </linearGradient>
    </defs>
    <path class="d" d="M457.44,0l457.44,457.44-457.44,457.44L0,457.44,457.44,0" vector-effect="none"/>
    <path class="c" d="M457.42,38.16l419.24,419.24-419.24,419.24L38.18,457.4,457.42,38.16" vector-effect="none"/>
</svg>
