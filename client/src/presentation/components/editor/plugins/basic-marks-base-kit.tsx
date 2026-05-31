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

import { CodeLeafStatic } from '@presentation/components/ui/code-node-static'
import { HighlightLeafStatic } from '@presentation/components/ui/highlight-node-static'
import { KbdLeafStatic } from '@presentation/components/ui/kbd-node-static'

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
