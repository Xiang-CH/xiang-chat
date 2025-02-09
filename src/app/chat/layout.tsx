import { ChatInputArea } from '~/components/chatInput';

export default function Layout({
    children,
  }: Readonly<{ children: React.ReactNode }>) {
    return (
      <div className="max-h-full h-full w-full box-border">
        <div className="p-4 h-full">
          <div className='flex flex-col min-h-full justify-between items-center'>
              {children}
              <ChatInputArea className='bottom-2'/>
          </div>
        </div>
      </div>
    );
  }