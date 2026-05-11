import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
import BaseTextarea from './BaseTextarea.vue'
import BaseSelect from './BaseSelect.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import BaseCheckboxGroup from './BaseCheckboxGroup.vue'
import BaseRadioGroup from './BaseRadioGroup.vue'
import BaseToggle from './BaseToggle.vue'
import BaseSlider from './BaseSlider.vue'
import BaseRating from './BaseRating.vue'
import BaseTagInput from './BaseTagInput.vue'
import BaseFileUpload from './BaseFileUpload.vue'
import BaseTreeSelect from './BaseTreeSelect.vue'
import BaseModal from './BaseModal.vue'
import BaseDrawer from './BaseDrawer.vue'

export {
  BaseButton,
  BaseInput,
  BaseTextarea,
  BaseSelect,
  BaseCheckbox,
  BaseCheckboxGroup,
  BaseRadioGroup,
  BaseToggle,
  BaseSlider,
  BaseRating,
  BaseTagInput,
  BaseFileUpload,
  BaseTreeSelect,
  BaseModal,
  BaseDrawer,
}

export { useForm } from './useForm.js'
export * as validators from './validators.js'

import { useForm } from './useForm.js'

export default {
  install(app) {
    app.component('BaseButton', BaseButton)
    app.component('BaseInput', BaseInput)
    app.component('BaseTextarea', BaseTextarea)
    app.component('BaseSelect', BaseSelect)
    app.component('BaseCheckbox', BaseCheckbox)
    app.component('BaseCheckboxGroup', BaseCheckboxGroup)
    app.component('BaseRadioGroup', BaseRadioGroup)
    app.component('BaseToggle', BaseToggle)
    app.component('BaseSlider', BaseSlider)
    app.component('BaseRating', BaseRating)
    app.component('BaseTagInput', BaseTagInput)
    app.component('BaseFileUpload', BaseFileUpload)
    app.component('BaseTreeSelect', BaseTreeSelect)
    app.component('BaseModal', BaseModal)
    app.component('BaseDrawer', BaseDrawer)
  }
}
