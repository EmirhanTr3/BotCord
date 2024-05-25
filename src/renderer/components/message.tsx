import { Message } from "src/shared/types"
import { BotBadge, PFP } from "."
import { useUserModal } from "../hooks"

export default function MessageC({ message, extraClass }: { message: Message, extraClass?: string[] }) {
    const [UserModal, isUserModalOpen, toggleUserModal] = useUserModal(message.author)

    function downloadAttachment(url: string) {
        window.api.send("openURL", url)
    }

    return <>
        {isUserModalOpen && UserModal}
        
        <div id="message" className={"hover" + (extraClass ? " " + extraClass.join(" ") : "")}>
            <div id="messagecontent">
                {!extraClass?.includes("anothermessage") && <PFP src={message.author.avatar} height={42} width={42} onClick={toggleUserModal}/>}
                <div id="content">
                    {!extraClass?.includes("anothermessage") &&
                        <div>
                            <p id="username" style={{color: message.author.displayColor}} onClick={toggleUserModal}>{message.author.displayName}</p>
                            {(message.author.bot || message.author.webhook) && <BotBadge member={message.author} />}
                            <p id="time">{message.createdAt}</p>
                        </div>
                    }
                    <div id="msg">
                        <div id="msgcontent">
                            {message.content}
                            {message.editedTimestamp && <p id="edited">(edited)</p>}
                        </div>
                        {message.embeds?.map((embed, index) => {
                            const data = embed.data
                            return <div key={index} id ="embed">
                                <div id="color" style={{background: "#" + (data.color ? data.color.toString(16).padStart(6, '0') : "101010")}} />
                                <div id="embedcontent">
                                    <div id="embedcontentdata">
                                        <div id="embedcontentdatacontent">
                                            {data.author && 
                                                <div id="author">
                                                    {data.author.icon_url && <img id="authoricon" src={data.author.icon_url} />}
                                                    {data.author.url ?
                                                        <a id="authorname" href={data.author.url}>{data.author.name}</a> :
                                                        <p id="authorname">{data.author.name}</p>
                                                    }
                                                </div>
                                            }
                                            {data.title && (
                                                data.url ?
                                                    <a id="title" href={data.url}>{data.title}</a> :
                                                    <p id="title">{data.title}</p>
                                                )}
                                            {data.description && <p id="description">{data.description}</p>}
                                            {data.fields &&
                                                <div id="fields">
                                                    {data.fields.map((field, index) =>
                                                        <div key={index} id="field">
                                                            <p id="fieldname">{field.name}</p>
                                                            <p id="fieldvalue">{field.value}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        </div>
                                        {data.thumbnail && <img id="thumbnail" src={data.thumbnail.url}/>}
                                    </div>
                                    {data.image && <img id="image" src={data.image.url}/>}
                                    {data.footer &&
                                        <div id="footer">
                                            {data.footer.icon_url && <img id="footericon" src={data.footer.icon_url} />}
                                            <p id="footertext">{data.footer.text}</p>
                                        </div>
                                    }
                                </div>
                            </div>
                        })}
                        {message.attachments?.map((attachment, index) => 
                            <div key={index} id="attachments">
                                {
                                    attachment.contentType?.startsWith("image") ? <img src={attachment.url}/> :
                                    attachment.contentType?.startsWith("video") ? <video src={attachment.url} controls/> :
                                    <div id="file">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#ebebeb" viewBox="0 0 256 256"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM152,88V44l44,44Z"></path></svg>
                                        <div id="info">
                                            <p id="name">{attachment.name}</p>
                                            <p id="size">{attachment.size} bytes</p>
                                        </div>
                                        <svg id="download" className="hover" onClick={() => downloadAttachment(attachment.url)} xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#ebebeb" viewBox="0 0 256 256"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40A8,8,0,0,0,168,96H136V32a8,8,0,0,0-16,0V96H88a8,8,0,0,0-5.66,13.66Z"></path></svg>
                                    </div>
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </>
}


/*
*msgcontent:
  *content
  *editedtimestamp
*embeds:
  *embed:
    *color
    *embedcontent:
      *embedcontentdata:
        *embedcontentdatacontent:
          *author:
            *authoricon
            *authorname
          *title
          *description
          *fields:
            *field:
              *fieldname
              *fieldvalue
        *thumbnail
      *image
      *footer:
        *footericon
        *footertext
*attachments:
  !link to attachment converter wont be made for now
  *img/video/attachment
  *if attachment:
    *file
    *fileIcon
    *info
    *name
    *size
    *download
*/