import type {ReactNode} from 'react';
import ChatbotIcon from '@site/src/components/ChatbotIcon';

export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <ChatbotIcon />
    </>
  );
}
