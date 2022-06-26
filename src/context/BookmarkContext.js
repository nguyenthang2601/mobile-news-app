import React, { useContext, useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import md5 from 'md5';

import { AuthContext } from './AuthContext';
import { Alert } from 'react-native';
import { detailDraft, listDraft } from '../utils/fetch/draft';

export const BookmarkContext = React.createContext({});

export const BookmarkProvider = ({ children }) => {
  const [url, setUrl] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { user } = useContext(AuthContext);

  const commentsRef = firestore().collection('articles');

  useEffect(() => {
    (async () => {
      try {
        console.log('flood 1');
        if (user) {
          console.log('flood 2');
          if (url) {
            
            const draft = await detailDraft({ url });
            console.log('flood 3', draft);

            if (draft) {
              setIsBookmarked(true);
              return;
            }

            setIsBookmarked(false);
            // const article = (await commentsRef.doc(newUrl).get()).data();
            // if (article !== undefined) {
            //   if (article.savedBy.includes(user.email)) {
            //     setIsBookmarked(true);
            //   } else {
            //     setIsBookmarked(false);
            //   }
            // } else {
            //   setIsBookmarked(false);
            // }
          }
        }
      } catch (err) {
        Alert.alert(
          'Error occured',
          'Error while fetching bookmarkeds, please restart the app',
        );
      }
    })();
  }, [url]);

  useEffect(() => {
    (async () => {
      try {
        if (user) {
          const drafts = await listDraft('');

          if (drafts) {
            console.log('list draft: ', drafts);
            setBookmarks(drafts);
          }
        }
      } catch (err) {
        Alert.alert(
          'Error occured',
          'Error while fetching bookmark list, please restart the app',
        );
      }
    })();
  }, [user]);

  const values = {
    bookmarks,
    isBookmarked,
    setIsBookmarked: (bool) => {
      setIsBookmarked(bool);
    },
    setBookmarks: (art) => {
      setBookmarks(art);
    },
    setUrl: (u) => {
      setUrl(u);
    },
  };

  return (
    <BookmarkContext.Provider value={values}>
      {children}
    </BookmarkContext.Provider>
  );
};
