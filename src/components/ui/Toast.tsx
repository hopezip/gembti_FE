import { Portal } from '@ark-ui/react/portal';
import {
  createToaster,
  Toast as ArkToast,
  Toaster as ArkToaster,
  useToastContext,
} from '@ark-ui/react/toast';
import {
  CheckCircleIcon,
  CircleAlertIcon,
  CircleXIcon,
  InfoIcon,
  XIcon,
} from 'lucide-react';
import { toast as toastRecipe } from 'styled-system/recipes';

type ToastType = 'success' | 'error' | 'warning' | 'info';

// Toast는 Button/Tag와 달리 전역 store + Portal + slot 렌더러가 필요한 compound UI다.
// 시각 스타일은 src/theme/recipes/toast.ts slot recipe가 담당한다.
const styles = toastRecipe();
const { Root, Title, Description, CloseTrigger } = ArkToast;

const iconByType = {
  success: CheckCircleIcon,
  error: CircleXIcon,
  warning: CircleAlertIcon,
  info: InfoIcon,
} satisfies Record<ToastType, typeof CheckCircleIcon>;

export const toaster = createToaster({
  placement: 'top',
  pauseOnPageIdle: true,
  overlap: false,
  max: 5,
});

// Ark Toast context에서 현재 toast type을 읽어 상태별 아이콘을 렌더한다.
function ToastIcon() {
  const { type } = useToastContext();
  const Icon = iconByType[type as ToastType];

  if (!Icon) return null;

  return <Icon aria-hidden="true" data-part="icon" data-type={type} />;
}

export function Toaster() {
  return (
    <Portal>
      {/* ArkToaster가 store의 toast 목록을 render callback으로 전달한다. */}
      <ArkToaster className={styles.group} toaster={toaster}>
        {(toast) => (
          <Root className={styles.root} data-type={toast.type}>
            <ToastIcon />
            <div data-part="content">
              {toast.title && (
                <Title className={styles.title}>{toast.title}</Title>
              )}
              {toast.description && (
                <Description className={styles.description}>
                  {toast.description}
                </Description>
              )}
            </div>
            {toast.closable && (
              <CloseTrigger
                aria-label="Toast 닫기"
                className={styles.closeTrigger}
              >
                <XIcon aria-hidden="true" data-part="close-icon" />
              </CloseTrigger>
            )}
          </Root>
        )}
      </ArkToaster>
    </Portal>
  );
}
