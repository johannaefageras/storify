<script>
  let {
    size = 24,
    class: className = '',
    ...rest
  } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width={size}
  height={size}
  class={className}
  aria-hidden="true"
  {...rest}
>
  <g stroke-linecap="square" stroke-miterlimit="10" fill="currentColor" stroke-linejoin="miter" class="nc-icon-wrapper"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="m12,17v-5.5c0-.276-.224-.5-.5-.5h-1.5" fill="none" stroke="currentColor" stroke-width="2" data-color="color-2"></path><circle cx="12" cy="7.25" r="1.25" fill="currentColor" stroke-width="0" data-color="color-2" data-cap="butt" stroke-linecap="butt"></circle></g>
</svg>
