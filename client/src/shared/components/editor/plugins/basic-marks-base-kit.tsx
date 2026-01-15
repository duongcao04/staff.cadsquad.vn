import {
    BaseBoldPlugin,
    BaseCodePlugin,
    BaseHighlightPlugin,
    BaseItalicPlugin,
    BaseKbdPlugin,
    BaseStrikethroughPlugin,
    BaseSubscriptPlugin,
    BaseSuperscriptPlugin,
    BaseUnderlinePlugin,
} from '@platejs/basic-nodes'

import { CodeLeafStatic } from '@/shared/components/ui/code-node-static'
import { HighlightLeafStatic } from '@/shared/components/ui/highlight-node-static'
import { KbdLeafStatic } from '@/shared/components/ui/kbd-node-static'

export const BaseBasicMarksKit = [
    BaseBoldPlugin,
    BaseItalicPlugin,
    BaseUnderlinePlugin,
    BaseCodePlugin.withComponent(CodeLeafStatic),
    BaseStrikethroughPlugin,
    BaseSubscriptPlugin,
    BaseSuperscriptPlugin,
    BaseHighlightPlugin.withComponent(HighlightLeafStatic),
    BaseKbdPlugin.withComponent(KbdLeafStatic),
]
