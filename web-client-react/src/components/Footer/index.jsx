import "./index.scss"
import { Container, Header, List, Segment } from "semantic-ui-react"
import { Modal } from "react-responsive-modal"
import { useState } from "react"
import { useSelector } from "react-redux"
import { appendClassName, capitalize } from "../../utils/general"
import * as translations from "../../assets/translate.json"

const items = ["about", "privacy", "rules"]

const FooterComponent = () => {
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)

    const [activeItem, setActiveItem] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)

    return (
        <>
            <Segment className="footerSegment" inverted={inverted} vertical>
                <Container textAlign="center">
                    <List horizontal inverted={inverted}>
                        {items.map((item) => (
                            <List.Item
                                key={item}
                                onClick={() => {
                                    setActiveItem(item)
                                    setModalOpen(true)
                                }}
                            >
                                {translations[language].footer[item]}
                            </List.Item>
                        ))}
                    </List>
                    <Header
                        as="p"
                        content="&copy; 2025 Scenes and the City"
                        inverted={inverted}
                        size="tiny"
                    />
                </Container>
            </Segment>
            {activeItem && (
                <Modal
                    classNames={{
                        overlay: appendClassName("footerModalOverlay simpleModalOverlay", inverted),
                        modal: appendClassName("footerModal simpleModal", inverted)
                    }}
                    onClose={() => setModalOpen(false)}
                    onOpen={() => setModalOpen(true)}
                    open={modalOpen}
                    showCloseIcon={false}
                >
                    <Header as="h2" inverted={inverted} content={capitalize(activeItem)} />
                    {activeItem === "about" && (
                        <>
                            <Header as="p" inverted={inverted} size="small">
                                Scenes and the City was created in 2025 after I unintentionally
                                viewed a then 21 year old clip from the TV show Law & Order. A
                                perennial favorite amongst fans of the cop drama genre, it's
                                certainly no secret to longtime viewers that the show has been
                                filmed in NYC. It's been on the air for well over year thirty years
                                and thoughout the years an astonishingly large number of both famous
                                and infamous acrors and actresses have appeared as cast members on
                                the show.
                            </Header>
                            <Header as="p" inverted={inverted} size="small">
                                The particular clip that inspired me to create this app doesn't
                                really feature any good actors or actresses though - unless you
                                consider Ice-T a good actor and he's more of a rapper than an actor
                                anyways. Despite the incredibly cheesy dialogue and the overly
                                dramatic sound effects that accompany it, the most glaring thing
                                that stood out to me was the red skyscraper in tbe background. I had
                                seen it before. I knew it. I was 100% positive. It was on the Upper
                                West Side. I just wasn't quite sure where yet...
                            </Header>
                            <Header as="p" inverted={inverted} size="small">
                                And then I sort of had an epiphany moment. And, no. In case you're
                                wondering, I'm not gay. I promise! Anyways, though... it began to
                                dawn on me that so many movies and TV shows have been filmed in NYC
                                even dating back to the 50's. There's something about the concrete
                                jungle and its grit and its grime that simply cannot be replicated
                                by any of the Hollywood studios. That's why the opening shots of the
                                TV show Friends prominently feature an old building in the West
                                Village but they only film the interior scenes in LA. Same with All
                                in the Family.There's an energy and an atmoshphere in Manhattan than
                                can't be replicated anywhere else.
                            </Header>
                        </>
                    )}
                    {activeItem === "privacy" && (
                        <>
                            <Header as="p" inverted={inverted} size="small">
                                Scenes and the City was created in 2025 after I unintentionally
                                viewed a then 21 year old clip from the TV show Law & Order. A
                                perennial favorite amongst fans of the cop drama genre, it's
                                certainly no secret to longtime viewers that the show has been
                                filmed in NYC. It's been on the air for well over year thirty years
                                and thoughout the years an astonishingly large number of both famous
                                and infamous acrors and actresses have appeared as cast members on
                                the show.
                            </Header>
                            <Header as="p" inverted={inverted} size="small">
                                The particular clip that inspired me to create this app doesn't
                                really feature any good actors or actresses though - unless you
                                consider Ice-T a good actor and he's more of a rapper than an actor
                                anyways. Despite the incredibly cheesy dialogue and the overly
                                dramatic sound effects that accompany it, the most glaring thing
                                that stood out to me was the red skyscraper in tbe background. I had
                                seen it before. I knew it. I was 100% positive. It was on the Upper
                                West Side. I just wasn't quite sure where yet...
                            </Header>
                            <Header as="p" inverted={inverted} size="small">
                                And then I sort of had an epiphany moment. And, no. In case you're
                                wondering, I'm not gay. I promise! Anyways, though... it began to
                                dawn on me that so many movies and TV shows have been filmed in NYC
                                even dating back to the 50's. There's something about the concrete
                                jungle and its grit and its grime that simply cannot be replicated
                                by any of the Hollywood studios. That's why the opening shots of the
                                TV show Friends prominently feature an old building in the West
                                Village but they only film the interior scenes in LA. Same with All
                                in the Family.There's an energy and an atmoshphere in Manhattan than
                                can't be replicated anywhere else.
                            </Header>
                        </>
                    )}
                    {activeItem === "rules" && (
                        <>
                            <Header as="p" inverted={inverted} size="small">
                                Scenes and the City was created in 2025 after I unintentionally
                                viewed a then 21 year old clip from the TV show Law & Order. A
                                perennial favorite amongst fans of the cop drama genre, it's
                                certainly no secret to longtime viewers that the show has been
                                filmed in NYC. It's been on the air for well over year thirty years
                                and thoughout the years an astonishingly large number of both famous
                                and infamous acrors and actresses have appeared as cast members on
                                the show.
                            </Header>
                            <Header as="p" inverted={inverted} size="small">
                                The particular clip that inspired me to create this app doesn't
                                really feature any good actors or actresses though - unless you
                                consider Ice-T a good actor and he's more of a rapper than an actor
                                anyways. Despite the incredibly cheesy dialogue and the overly
                                dramatic sound effects that accompany it, the most glaring thing
                                that stood out to me was the red skyscraper in tbe background. I had
                                seen it before. I knew it. I was 100% positive. It was on the Upper
                                West Side. I just wasn't quite sure where yet...
                            </Header>
                            <Header as="p" inverted={inverted} size="small">
                                And then I sort of had an epiphany moment. And, no. In case you're
                                wondering, I'm not gay. I promise! Anyways, though... it began to
                                dawn on me that so many movies and TV shows have been filmed in NYC
                                even dating back to the 50's. There's something about the concrete
                                jungle and its grit and its grime that simply cannot be replicated
                                by any of the Hollywood studios. That's why the opening shots of the
                                TV show Friends prominently feature an old building in the West
                                Village but they only film the interior scenes in LA. Same with All
                                in the Family.There's an energy and an atmoshphere in Manhattan than
                                can't be replicated anywhere else.
                            </Header>
                        </>
                    )}
                </Modal>
            )}
        </>
    )
}

FooterComponent.propTypes = {}

export default FooterComponent
