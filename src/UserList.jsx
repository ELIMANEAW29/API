import { useEffect, useState } from 'react'
import axios from 'axios'

const usersUrl = 'https://jsonplaceholder.typicode.com/users'
const avatarColors = ['coral', 'moss', 'sky', 'gold']

function getInitials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function UserList() {
  const [listOfUsers, setListOfUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedUserId, setExpandedUserId] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchUsers() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await axios.get(usersUrl, { signal: controller.signal })
        setListOfUsers(response.data)
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setError('Impossible de récupérer les utilisateurs. Vérifiez votre connexion, puis réessayez.')
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    fetchUsers()
    return () => controller.abort()
  }, [retryCount])

  const filteredUsers = listOfUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  ).sort((firstUser, secondUser) => firstUser.name.localeCompare(secondUser.name))

  function toggleUser(userId) {
    setExpandedUserId((currentId) => (currentId === userId ? null : userId))
  }

  return (
    <main className="directory-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Annuaire, accueil">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>atelier<span className="brand-dot">.</span></span>
        </a>
        <div className="topbar-note"><span className="live-dot" /> Espace équipe</div>
      </header>

      <section className="directory-content" id="top" aria-labelledby="page-title">
        <div className="page-heading">
          <div>
            <p className="eyebrow">COLLECTIF / PERSONNES</p>
            <h1 id="page-title">L’annuaire<span className="title-period">.</span></h1>
            <p className="page-description">Les visages et les contacts de votre équipe, au même endroit.</p>
          </div>
          <div className="people-count" aria-live="polite">
            <span className="count-number">{isLoading ? '—' : filteredUsers.length.toString().padStart(2, '0')}</span>
            <span className="count-label">{searchQuery ? 'résultat(s)' : 'personnes'}</span>
          </div>
        </div>

        <div className="list-toolbar">
          <label className="search-box">
            <span className="search-icon" aria-hidden="true" />
            <span className="visually-hidden">Rechercher par nom</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher une personne…"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                className="clear-search"
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Effacer la recherche"
                title="Effacer la recherche"
              >
                ×
              </button>
            )}
          </label>
          <span className="sort-label"><span className="sort-glyph" aria-hidden="true">↕</span> Nom · A à Z</span>
        </div>

        <div className="people-list" aria-live="polite">
          {isLoading && (
            <div className="state-message" role="status">
              <span className="loading-spinner" aria-hidden="true" />
              <span>Chargement des utilisateurs…</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="state-message error-state" role="alert">
              <span>{error}</span>
              <button type="button" className="retry-button" onClick={() => setRetryCount((count) => count + 1)}>
                Réessayer <span aria-hidden="true">↗</span>
              </button>
            </div>
          )}

          {!isLoading && !error && filteredUsers.map((user) => {
            const isExpanded = expandedUserId === user.id

            return (
              <article className={`person-row ${isExpanded ? 'is-expanded' : ''}`} key={user.id}>
                <button
                  className="person-summary"
                  type="button"
                  onClick={() => toggleUser(user.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`user-details-${user.id}`}
                >
                  <span className={`avatar avatar-${avatarColors[(user.id - 1) % avatarColors.length]}`} aria-hidden="true">
                    {getInitials(user.name)}
                  </span>
                  <span className="person-identity">
                    <span className="person-name">{user.name}</span>
                    <span className="person-handle">@{user.username.toLowerCase()}</span>
                  </span>
                  <span className="person-email">{user.email}</span>
                  <span className="person-company">{user.company.name}</span>
                  <span className={`expand-indicator ${isExpanded ? 'expanded' : ''}`} aria-hidden="true">⌄</span>
                </button>

                {isExpanded && (
                  <div className="person-details" id={`user-details-${user.id}`}>
                    <div className="detail-block">
                      <span className="detail-label">ADRESSE</span>
                      <span>{user.address.street}, {user.address.suite}</span>
                      <span>{user.address.city} {user.address.zipcode}</span>
                    </div>
                    <div className="detail-block">
                      <span className="detail-label">CONTACT</span>
                      <a href={`tel:${user.phone}`}>{user.phone}</a>
                      <a href={`https://${user.website}`} target="_blank" rel="noreferrer">{user.website} <span aria-hidden="true">↗</span></a>
                    </div>
                    <div className="detail-block company-motto">
                      <span className="detail-label">EN BREF</span>
                      <span>{user.company.catchPhrase}</span>
                    </div>
                  </div>
                )}
              </article>
            )
          })}

          {!isLoading && !error && filteredUsers.length === 0 && (
            <div className="state-message empty-state">
              Aucun résultat pour « {searchQuery} ».
              <button type="button" className="retry-button" onClick={() => setSearchQuery('')}>Effacer la recherche</button>
            </div>
          )}
        </div>

        <footer className="list-footer">
          <span>ANNUAIRE INTERNE</span>
          <span>Données synchronisées avec JSONPlaceholder</span>
        </footer>
      </section>
    </main>
  )
}

export default UserList