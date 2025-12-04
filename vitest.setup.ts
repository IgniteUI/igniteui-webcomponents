import { chai } from 'vitest';
import chaiDom from 'chai-dom';
import { chaiDomDiff } from '@open-wc/semantic-dom-diff';
import { chaiA11yAxe } from 'chai-a11y-axe';

chai.use(chaiDom);
chai.use(chaiDomDiff);
chai.use(chaiA11yAxe);
